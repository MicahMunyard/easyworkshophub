
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Mock function to fetch emails
const fetchEmails = async (userId: string) => {
  try {
    // This is a placeholder for the actual email fetching logic
    console.log(`Fetching emails for user: ${userId}`);
    
    // Mock email data
    const emails = [
      {
        id: "email-1",
        subject: "Brake Service Request",
        from: "John Smith",
        sender_email: "john@example.com",
        date: new Date().toISOString(),
        content: "<p>Hello, I would like to schedule a brake service for my Toyota Camry. Is Tuesday at 10am available?</p>",
        is_booking_email: true,
        booking_created: false,
        extracted_details: {
          name: "John Smith",
          phone: "555-123-4567",
          date: "2025-04-05",
          time: "10:00 AM",
          service: "Brake Service",
          vehicle: "Toyota Camry"
        }
      },
      {
        id: "email-2",
        subject: "Oil Change Inquiry",
        from: "Sarah Johnson",
        sender_email: "sarah@example.com",
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        content: "<p>Hi, I need an oil change for my Honda Civic. Do you have any availability this week?</p>",
        is_booking_email: true,
        booking_created: false,
        extracted_details: {
          name: "Sarah Johnson",
          phone: "555-987-6543",
          date: null,
          time: null,
          service: "Oil Change",
          vehicle: "Honda Civic"
        }
      },
      {
        id: "email-3",
        subject: "Parts Order Confirmation",
        from: "Auto Parts Warehouse",
        sender_email: "orders@autoparts.example.com",
        date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        content: "<p>Thank you for your order #12345. Your parts have been shipped and should arrive within 3-5 business days.</p>",
        is_booking_email: false,
        booking_created: false
      }
    ];
    
    return {
      success: true,
      emails
    };
  } catch (error) {
    console.error("Error fetching emails:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch emails"
    };
  }
};

// Mock function to create a booking from an email
const createBookingFromEmail = async (userId: string, emailId: string) => {
  try {
    // This is a placeholder for the actual booking creation logic
    console.log(`Creating booking from email ${emailId} for user ${userId}`);
    
    // Simulate successful booking creation
    return {
      success: true,
      message: "Booking successfully created"
    };
  } catch (error) {
    console.error("Error creating booking from email:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking from email"
    };
  }
};

// Mock function to send an order email
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

    // Check for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Missing or invalid token" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract the token (in a real app, validate this token)
    const token = authHeader.substring(7);
    const userId = "mock-user-id"; // In a real app, extract this from the token

    // Parse the request body to get the action
    const requestData = await req.json();
    const action = requestData.action || 'fetch'; // Default action is fetch

    if (path === "email-integration") {
      if (action === 'create-booking' && requestData.emailId) {
        const result = await createBookingFromEmail(userId, requestData.emailId);
        
        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else if (action === 'send-order') {
        const { supplierEmail, supplierName, subject, orderHtml } = requestData;
        
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
      } else {
        // Default action: fetch emails
        const result = await fetchEmails(userId);
        
        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
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
