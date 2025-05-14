import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Get the SendGrid API Key from environment variables
const SENDGRID_API_KEY = Deno.env.get("WorkshopBase_Email_Marketing");

// Check if API key is configured
if (!SENDGRID_API_KEY) {
  console.error("SendGrid API Key is not configured");
}

interface EmailRecipient {
  email: string;
  name?: string;
}

interface SendgridEmailOptions {
  to: string | EmailRecipient | Array<string | EmailRecipient>;
  subject: string;
  text?: string;
  html?: string;
  from_name?: string;
  from_email?: string;
  replyTo?: string;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

interface SendEmailRequest {
  workshopName: string;
  options: SendgridEmailOptions;
  replyToEmail?: string;
}

interface SendCampaignRequest {
  workshopName: string;
  recipients: EmailRecipient[];
  options: SendgridEmailOptions;
  replyToEmail?: string;
}

// Generate a dynamic workshop email
function generateWorkshopEmail(workshopName: string): string {
  const emailPrefix = workshopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  
  return `${emailPrefix}@workshopbase.com.au`;
}

// Helper to format email recipients
function formatRecipients(recipients: string | EmailRecipient | Array<string | EmailRecipient>): Array<{ email: string; name?: string }> {
  if (!recipients) {
    throw new Error("Recipients (to field) is required");
  }
  
  // Convert to array if it's not already
  const recipientsArray = Array.isArray(recipients) ? recipients : [recipients];
  
  return recipientsArray.map(recipient => {
    if (typeof recipient === 'string') {
      return { email: recipient };
    }
    if (typeof recipient === 'object' && recipient !== null && 'email' in recipient) {
      return recipient as EmailRecipient;
    }
    throw new Error("Invalid recipient format. Expected string or object with email property");
  });
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    console.log(`Processing request to endpoint: ${path}`);

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "SendGrid API Key is not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Handle single email
    if (path === "send") {
      const requestData = await req.json();
      console.log("Received request data:", JSON.stringify(requestData, null, 2));
      
      const { workshopName, options, replyToEmail } = requestData as SendEmailRequest;
      
      if (!options.to) {
        const error = "Validation error: Missing recipient (to field)";
        console.error(error);
        return new Response(
          JSON.stringify({ success: false, error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Generate the dynamic workshop email if not provided
      const fromEmail = options.from_email || generateWorkshopEmail(workshopName);
      
      // Format recipients using helper function
      try {
        const formattedRecipients = formatRecipients(options.to);
        
        // Prepare payload
        const payload = {
          personalizations: [
            {
              to: formattedRecipients,
              subject: options.subject,
              dynamic_template_data: options.dynamicTemplateData,
            },
          ],
          from: {
            email: fromEmail,
            name: options.from_name || workshopName
          },
          reply_to: replyToEmail ? { email: replyToEmail } : { email: fromEmail },
          content: [],
          template_id: options.templateId,
        };
        
        console.log("SendGrid API payload:", JSON.stringify(payload, null, 2));
        
        // Add plain text content if provided
        if (options.text) {
          payload.content.push({
            type: "text/plain",
            value: options.text,
          });
        }
        
        // Add HTML content if provided
        if (options.html) {
          payload.content.push({
            type: "text/html",
            value: options.html,
          });
        }
        
        // Send the request to SendGrid
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SendGrid API error: ${response.status} ${errorText}`);
          throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: response.headers.get('x-message-id') 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error formatting recipients or sending email:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }
    
    // Handle email campaign
    else if (path === "campaign") {
      const requestData = await req.json();
      console.log("Received campaign request data:", JSON.stringify(requestData, null, 2));
      
      const { workshopName, recipients, options, replyToEmail } = requestData as SendCampaignRequest;
      
      if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
        const error = "Validation error: Recipients array is required and cannot be empty";
        console.error(error);
        return new Response(
          JSON.stringify({ success: false, error }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
      
      // Generate the dynamic workshop email if not provided
      const fromEmail = options.from_email || generateWorkshopEmail(workshopName);
      
      try {
        // Prepare payload
        const payload = {
          personalizations: recipients.map(recipient => ({
            to: [{ email: recipient.email, name: recipient.name }],
            subject: options.subject,
            dynamic_template_data: options.dynamicTemplateData,
          })),
          from: {
            email: fromEmail,
            name: options.from_name || workshopName
          },
          reply_to: replyToEmail ? { email: replyToEmail } : { email: fromEmail },
          content: [],
          template_id: options.templateId,
        };
        
        console.log("SendGrid API campaign payload:", JSON.stringify(payload, null, 2));
        
        // Add plain text content if provided
        if (options.text) {
          payload.content.push({
            type: "text/plain",
            value: options.text,
          });
        }
        
        // Add HTML content if provided
        if (options.html) {
          payload.content.push({
            type: "text/html",
            value: options.html,
          });
        }
        
        // Send the request to SendGrid
        const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SENDGRID_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SendGrid API error: ${response.status} ${errorText}`);
          throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            messageId: response.headers.get('x-message-id'),
            recipientCount: recipients.length
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error("Error sending campaign:", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }
    
    // Handle analytics request
    else if (path === "analytics") {
      // This would be expanded with real SendGrid analytics API calls
      // For now just return mock data
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: [
            { 
              campaign_id: "camp-1", 
              campaign_name: "Winter Special", 
              date: "2025-01-15", 
              sent_count: 120, 
              open_count: 65, 
              click_count: 28 
            },
            { 
              campaign_id: "camp-2", 
              campaign_name: "New Year Offer", 
              date: "2025-02-01", 
              sent_count: 85, 
              open_count: 32, 
              click_count: 15 
            },
            { 
              campaign_id: "camp-3", 
              campaign_name: "Service Reminder", 
              date: "2025-03-01", 
              sent_count: 43, 
              open_count: 27, 
              click_count: 12 
            },
            { 
              campaign_id: "camp-4", 
              campaign_name: "Spring Promotion", 
              date: "2025-04-01", 
              sent_count: 100, 
              open_count: 55, 
              click_count: 23 
            },
            { 
              campaign_id: "camp-5", 
              campaign_name: "Summer Service", 
              date: "2025-05-01", 
              sent_count: 80, 
              open_count: 48, 
              click_count: 18 
            }
          ]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Invalid endpoint" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );

  } catch (error) {
    console.error("Error in SendGrid edge function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
