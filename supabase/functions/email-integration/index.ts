
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Mock functions for now - in production these would connect to actual email servers
const connectToEmailServer = async (provider, email, password, userId) => {
  try {
    console.log(`Connecting to ${provider} email server for user ${userId}`);
    
    // In production, this would use ImapFlow or similar library to connect to actual email servers
    // For now, simulate a successful connection
    return {
      success: true,
      message: "Successfully connected to email server"
    };
  } catch (error) {
    console.error("Error connecting to email server:", error);
    return {
      success: false,
      error: error.message || "Failed to connect to email server"
    };
  }
};

const disconnectFromEmailServer = async (userId) => {
  try {
    console.log(`Disconnecting email for user ${userId}`);
    
    // In production, this would close IMAP connections and clean up resources
    return {
      success: true,
      message: "Successfully disconnected from email server"
    };
  } catch (error) {
    console.error("Error disconnecting from email server:", error);
    return {
      success: false,
      error: error.message || "Failed to disconnect from email server"
    };
  }
};

// Fetch emails function with improved structure and error handling
const fetchEmails = async (userId) => {
  try {
    console.log(`Fetching emails for user: ${userId}`);
    
    // Mock email data - in production would fetch from IMAP server
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
          date: "2025-04-16",
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

// Create booking from email with improved validation and error handling
const createBookingFromEmail = async (userId, emailId) => {
  try {
    console.log(`Creating booking from email ${emailId} for user ${userId}`);
    
    // In production, this would:
    // 1. Retrieve the email content from the database
    // 2. Extract booking information if not already done
    // 3. Create a booking in the database
    // 4. Mark the email as processed
    
    // For now, simulate success
    return {
      success: true,
      message: "Booking successfully created",
      bookingId: "mock-booking-" + Math.random().toString(36).substring(2, 10)
    };
  } catch (error) {
    console.error("Error creating booking from email:", error);
    return {
      success: false,
      error: error.message || "Failed to create booking from email"
    };
  }
};

// Send email function with improved structure
const sendEmail = async (to, subject, body, userId) => {
  try {
    console.log(`Sending email to ${to} from user ${userId}`);
    console.log(`Subject: ${subject}`);
    
    // In production, would use SMTP connection to send actual email
    return {
      success: true,
      message: "Email sent successfully"
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message || "Failed to send email"
    };
  }
};

// Get email templates
const getEmailTemplates = async (userId) => {
  try {
    console.log(`Getting email templates for user ${userId}`);
    
    // In production, would fetch from database
    const templates = [
      {
        id: "template-1",
        name: "Booking Confirmation",
        subject: "Your booking has been confirmed",
        body: "Dear {customer_name},\n\nYour booking for {service} on {date} at {time} has been confirmed.\n\nThank you,\n{workshop_name}",
        is_default: true,
        template_type: "booking_confirmation"
      },
      {
        id: "template-2",
        name: "General Reply",
        subject: "Re: {original_subject}",
        body: "Hi {customer_name},\n\nThank you for your message. We'll get back to you shortly.\n\nBest regards,\n{workshop_name}",
        is_default: true,
        template_type: "general_reply"
      }
    ];
    
    return {
      success: true,
      templates
    };
  } catch (error) {
    console.error("Error getting email templates:", error);
    return {
      success: false,
      error: error.message || "Failed to get email templates"
    };
  }
};

// Route handler with better organization and error handling
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

    // Handle connect endpoint
    if (path === "connect") {
      const { provider, email, password } = requestData;
      
      // Validate required fields
      if (!provider || !email || !password) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: provider, email, password" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const result = await connectToEmailServer(provider, email, password, userId);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
    
    // Handle disconnect endpoint
    if (path === "disconnect") {
      const result = await disconnectFromEmailServer(userId);
      
      return new Response(
        JSON.stringify(result),
        {
          status: result.success ? 200 : 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle main email-integration endpoint
    if (path === "email-integration") {
      // Action: create-booking
      if (action === 'create-booking' && requestData.emailId) {
        const result = await createBookingFromEmail(userId, requestData.emailId);
        
        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } 
      // Action: send-email
      else if (action === 'send-email') {
        const { to, subject, body } = requestData;
        
        if (!to || !subject || !body) {
          return new Response(
            JSON.stringify({ error: "Missing required fields: to, subject, body" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        const result = await sendEmail(to, subject, body, userId);
        
        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      // Action: get-templates
      else if (action === 'get-templates') {
        const result = await getEmailTemplates(userId);
        
        return new Response(
          JSON.stringify(result),
          {
            status: result.success ? 200 : 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } 
      // Default action: fetch emails
      else {
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
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
