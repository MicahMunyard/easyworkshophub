import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface NotificationRequest {
  userId: string;
  email: string;
  fullName: string;
  workshopName: string;
  token: string;
  expiresAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userId,
      email,
      fullName,
      workshopName,
      token,
      expiresAt,
    }: NotificationRequest = await req.json();

    console.log("Sending approval notification for user:", userId);

    const adminEmail = Deno.env.get("ADMIN_EMAIL");
    const appUrl = Deno.env.get("APP_URL");

    if (!adminEmail) {
      throw new Error("ADMIN_EMAIL environment variable is not set");
    }

    if (!appUrl) {
      throw new Error("APP_URL environment variable is not set");
    }

    const approvalUrl = `${appUrl}/approve-account?token=${token}`;
    const signupDate = new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const emailResponse = await resend.emails.send({
      from: "WorkshopBase <onboarding@resend.dev>",
      to: [adminEmail],
      subject: `New WorkshopBase Account Signup - ${fullName}`,
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
                padding: 30px;
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
              .detail-row {
                margin: 12px 0;
                padding: 8px 0;
                border-bottom: 1px solid #f3f4f6;
              }
              .detail-label {
                font-weight: 600;
                color: #6b7280;
                display: inline-block;
                width: 140px;
              }
              .detail-value {
                color: #111827;
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
                text-align: center;
              }
              .button:hover {
                opacity: 0.9;
              }
              .expiry-notice {
                background: #fef3c7;
                border-left: 4px solid #f59e0b;
                padding: 12px 16px;
                margin: 20px 0;
                border-radius: 4px;
                font-size: 14px;
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
              <h1 style="margin: 0; font-size: 24px;">New Account Signup</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-bottom: 20px;">
                A new user has signed up for WorkshopBase and is awaiting approval.
              </p>
              
              <div style="margin: 24px 0;">
                <div class="detail-row">
                  <span class="detail-label">Name:</span>
                  <span class="detail-value">${fullName || 'Not provided'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">${email}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Workshop:</span>
                  <span class="detail-value">${workshopName || 'Not provided'}</span>
                </div>
                <div class="detail-row" style="border-bottom: none;">
                  <span class="detail-label">Signed up:</span>
                  <span class="detail-value">${signupDate}</span>
                </div>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${approvalUrl}" class="button">
                  Approve Account
                </a>
              </div>

              <div class="expiry-notice">
                ⏱️ This approval link expires in 7 days.
              </div>

              <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
                Click the button above to approve this account. The user will receive a welcome email 
                once their account is approved.
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">WorkshopBase Account Management</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-approval-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
