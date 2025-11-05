import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract token from query parameter
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(
        createHtmlResponse("Invalid Request", "No approval token provided.", false),
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Get client IP for security logging
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    // Initialize Supabase client with service role for admin access
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase configuration is missing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate token
    const { data: tokenData, error: tokenError } = await supabase
      .from("account_approval_tokens")
      .select("*, profiles!inner(user_id, full_name)")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (tokenError || !tokenData) {
      console.error("Token validation error:", tokenError);
      return new Response(
        createHtmlResponse(
          "Invalid or Expired Token",
          "This approval link is invalid or has expired. Please contact the user to request a new signup.",
          false
        ),
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    const userId = tokenData.user_id;

    // Get user email from auth.users
    const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);

    if (userError || !user) {
      console.error("Error fetching user:", userError);
      throw new Error("User not found");
    }

    // Update profile to approved status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        account_status: "approved",
        approved_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw new Error("Failed to approve account");
    }

    // Mark token as used
    const { error: tokenUpdateError } = await supabase
      .from("account_approval_tokens")
      .update({
        used: true,
        used_at: new Date().toISOString(),
        approved_by_ip: clientIp,
      })
      .eq("token", token);

    if (tokenUpdateError) {
      console.error("Error updating token:", tokenUpdateError);
    }

    // Send welcome email to user
    const appUrl = Deno.env.get("APP_URL");
    const userFullName = tokenData.profiles?.full_name || "there";

    try {
      await resend.emails.send({
        from: "WorkshopBase <onboarding@resend.dev>",
        to: [user.email!],
        subject: "Welcome to WorkshopBase - Your Account is Approved!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                }
                .header {
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 40px 30px;
                  border-radius: 8px 8px 0 0;
                  text-align: center;
                }
                .content {
                  background: #ffffff;
                  border: 1px solid #e5e7eb;
                  border-top: none;
                  padding: 30px;
                  border-radius: 0 0 8px 8px;
                }
                .button {
                  display: inline-block;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  color: white;
                  padding: 14px 32px;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  margin: 20px 0;
                }
                .info-box {
                  background: #f3f4f6;
                  border-left: 4px solid #667eea;
                  padding: 16px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .footer {
                  text-align: center;
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 1px solid #e5e7eb;
                  color: #6b7280;
                  font-size: 14px;
                }
              </style>
            </head>
            <body>
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">Welcome to WorkshopBase!</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Your account has been approved</p>
              </div>
              <div class="content">
                <p style="font-size: 16px;">Hi ${userFullName},</p>
                
                <p style="font-size: 16px;">
                  Great news! Your WorkshopBase account has been approved and is now active. 
                  You can now sign in and start managing your workshop with our comprehensive tools.
                </p>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${appUrl}/auth" class="button">
                    Sign In to WorkshopBase
                  </a>
                </div>

                <div class="info-box">
                  <p style="margin: 0 0 8px 0; font-weight: 600;">Your login email:</p>
                  <p style="margin: 0; color: #667eea; font-family: monospace;">${user.email}</p>
                </div>

                <h3 style="color: #111827; margin-top: 30px;">What's Next?</h3>
                <ul style="color: #4b5563; line-height: 1.8;">
                  <li>Complete your workshop profile setup</li>
                  <li>Add your first customers and vehicles</li>
                  <li>Configure your services and pricing</li>
                  <li>Start scheduling bookings</li>
                </ul>

                <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                  Need help getting started? Visit our help center or contact our support team.
                </p>
              </div>
              <div class="footer">
                <p style="margin: 0;">Welcome aboard!</p>
                <p style="margin: 5px 0 0 0;">The WorkshopBase Team</p>
              </div>
            </body>
          </html>
        `,
      });
      console.log("Welcome email sent to:", user.email);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
      // Don't fail the approval if email fails
    }

    return new Response(
      createHtmlResponse(
        "Account Approved!",
        `The account for ${user.email} has been successfully approved. A welcome email has been sent to the user.`,
        true
      ),
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in approve-account function:", error);
    return new Response(
      createHtmlResponse(
        "Error",
        "An error occurred while processing the approval. Please try again or contact support.",
        false
      ),
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

function createHtmlResponse(title: string, message: string, success: boolean): string {
  const appUrl = Deno.env.get("APP_URL") || "https://app.workshopbase.com.au";
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            text-align: center;
          }
          .icon {
            font-size: 60px;
            margin-bottom: 20px;
          }
          h1 {
            color: #111827;
            margin: 0 0 16px 0;
            font-size: 28px;
          }
          p {
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 24px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 8px;
          }
          .button:hover {
            opacity: 0.9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">${success ? '✅' : '❌'}</div>
          <h1>${title}</h1>
          <p>${message}</p>
          <a href="${appUrl}" class="button">Go to WorkshopBase</a>
        </div>
      </body>
    </html>
  `;
}

serve(handler);
