
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const sendEmailOrder = async (
  supplierEmail: string,
  supplierName: string,
  subject: string,
  orderHtml: string
) => {
  try {
    // This is a placeholder for the actual email sending logic
    // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
    console.log(`Sending order email to ${supplierName} (${supplierEmail})`);
    console.log(`Subject: ${subject}`);
    console.log(`Order contents: ${orderHtml.substring(0, 100)}...`);
    
    // Simulate successful email sending
    return {
      success: true,
      message: "Order email sent successfully"
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message || "Failed to send order email"
    };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Validate method
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    if (path === "send-order") {
      const { supplierEmail, supplierName, subject, orderHtml } = await req.json();
      
      // Validate required fields
      if (!supplierEmail || !supplierName || !subject || !orderHtml) {
        return new Response(
          JSON.stringify({
            error: "Missing required fields: supplierEmail, supplierName, subject, orderHtml"
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const result = await sendEmailOrder(supplierEmail, supplierName, subject, orderHtml);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Unknown endpoint" }),
      {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
