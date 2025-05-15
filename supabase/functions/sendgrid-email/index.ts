
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface SendEmailOptions {
  to: string | string[] | { email: string; name?: string } | Array<{ email: string; name?: string }>;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
  categories?: string[];
}

interface SendEmailRequest {
  workshopName: string;
  options: SendEmailOptions;
  replyToEmail?: string;
}

// Function to normalize recipient format
function normalizeRecipient(recipient: any): any {
  if (typeof recipient === 'string') {
    return { email: recipient };
  } else if (Array.isArray(recipient)) {
    return recipient.map(r => typeof r === 'string' ? { email: r } : r);
  }
  return recipient;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { workshopName, options, replyToEmail } = await req.json() as SendEmailRequest;
    
    // Log received data for debugging
    console.log("Received email request:");
    console.log("- Workshop name:", workshopName);
    console.log("- Options:", JSON.stringify(options));
    console.log("- Reply-To:", replyToEmail);
    
    // Validate required fields
    if (!options.to) {
      throw new Error("Missing required 'to' field");
    }
    
    if (!options.subject) {
      throw new Error("Missing required 'subject' field");
    }
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );
    
    // Check for SendGrid API key
    const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");
    if (!SENDGRID_API_KEY) {
      throw new Error("SendGrid API key not configured");
    }
    
    // Get sender email information
    const SENDER_EMAIL = Deno.env.get("SENDGRID_SENDER_EMAIL") || "no-reply@example.com";
    const SENDER_NAME = Deno.env.get("SENDGRID_SENDER_NAME") || workshopName;
    
    // Normalize recipient format
    const normalizedTo = normalizeRecipient(options.to);
    
    // Prepare email payload for SendGrid
    const emailPayload: any = {
      personalizations: [
        {
          to: Array.isArray(normalizedTo) ? normalizedTo : [normalizedTo],
        }
      ],
      from: {
        email: SENDER_EMAIL,
        name: SENDER_NAME,
      },
      subject: options.subject,
    };
    
    // Add reply-to if provided
    if (replyToEmail) {
      emailPayload.reply_to = {
        email: replyToEmail,
        name: workshopName
      };
    }
    
    // Add content based on what's provided
    if (options.templateId) {
      emailPayload.template_id = options.templateId;
      
      if (options.dynamicTemplateData) {
        emailPayload.personalizations[0].dynamic_template_data = options.dynamicTemplateData;
      }
    } else {
      // Use HTML or plain text content
      emailPayload.content = [];
      
      if (options.html) {
        emailPayload.content.push({
          type: "text/html",
          value: options.html
        });
      }
      
      if (options.text) {
        emailPayload.content.push({
          type: "text/plain",
          value: options.text
        });
      }
    }
    
    // Add categories if provided
    if (options.categories && options.categories.length > 0) {
      emailPayload.categories = options.categories;
    }
    
    console.log("Sending to SendGrid API:", JSON.stringify(emailPayload));
    
    // Send email using SendGrid API
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", response.status, errorText);
      throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
    }
    
    // Log successful email
    const emailLogEntry = {
      recipient: Array.isArray(normalizedTo) 
        ? normalizedTo.map(r => r.email).join(", ")
        : normalizedTo.email,
      subject: options.subject,
      template_id: options.templateId || null,
      status: "sent",
      workshop_name: workshopName
    };
    
    // Add email log entry to database
    const { error: logError } = await supabaseClient
      .from("email_logs")
      .insert(emailLogEntry);
      
    if (logError) {
      console.warn("Failed to log email:", logError);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in sendgrid-email function:", error);
    
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
