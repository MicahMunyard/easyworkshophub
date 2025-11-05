import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
}

interface SendEmailRequest {
  workshopName: string;
  options: SendEmailOptions;
  replyToEmail?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { workshopName, options, replyToEmail } = await req.json() as SendEmailRequest;
    
    console.log("Received email request:");
    console.log("- Workshop name:", workshopName);
    console.log("- To:", options.to);
    console.log("- Subject:", options.subject);
    console.log("- Reply-To:", replyToEmail);
    
    // Validate required fields
    if (!options.to) {
      throw new Error("Missing required 'to' field");
    }
    
    if (!options.subject) {
      throw new Error("Missing required 'subject' field");
    }
    
    // Check for Resend API key
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("Resend API key not configured. Please add RESEND_API_KEY secret.");
    }
    
    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);
    
    // Get sender email - use onboarding@resend.dev for testing or custom domain
    const SENDER_EMAIL = Deno.env.get("RESEND_SENDER_EMAIL") || "onboarding@resend.dev";
    const fromAddress = `${workshopName} <${SENDER_EMAIL}>`;
    
    // Prepare email data
    const emailData: any = {
      from: fromAddress,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
    };
    
    // Add reply-to if provided
    if (replyToEmail) {
      emailData.reply_to = replyToEmail;
    }
    
    // Add content
    if (options.html) {
      emailData.html = options.html;
    } else if (options.text) {
      emailData.text = options.text;
    } else {
      throw new Error("Either html or text content is required");
    }
    
    console.log("Sending email via Resend...");
    
    // Send email using Resend
    const { data, error: resendError } = await resend.emails.send(emailData);
    
    if (resendError) {
      console.error("Resend API error:", resendError);
      throw new Error(`Resend API error: ${resendError.message}`);
    }
    
    console.log("Email sent successfully:", data);
    
    // Initialize Supabase client for logging
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Log successful email
    const emailLogEntry = {
      recipient: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      status: "sent",
      workshop_name: workshopName
    };
    
    const { error: logError } = await supabaseClient
      .from("email_logs")
      .insert(emailLogEntry);
      
    if (logError) {
      console.warn("Failed to log email:", logError);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully", data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in resend-email function:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
