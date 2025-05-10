
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (!SENDGRID_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "SendGrid API Key is not configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Handle single email
    if (path === "send") {
      const { workshopName, options, replyToEmail } = await req.json() as SendEmailRequest;
      
      // Generate the dynamic workshop email if not provided
      const fromEmail = options.from_email || generateWorkshopEmail(workshopName);
      
      // Format recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const formattedRecipients = recipients.map(recipient => {
        if (typeof recipient === 'string') {
          return { email: recipient };
        }
        return recipient;
      });
      
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
        throw new Error(`SendGrid API error: ${response.status} ${errorText}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: response.headers.get('x-message-id') 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle email campaign
    else if (path === "campaign") {
      const { workshopName, recipients, options, replyToEmail } = await req.json() as SendCampaignRequest;
      
      // Generate the dynamic workshop email if not provided
      const fromEmail = options.from_email || generateWorkshopEmail(workshopName);
      
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
