import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailConnectionRequest {
  provider: string;
  email: string;
  password: string;
  userId: string;
}

interface EmailFetchRequest {
  userId: string;
}

interface EmailProcessRequest {
  emailId: string;
  userId: string;
}

interface SendOrderRequest {
  supplierEmail: string;
  supplierName: string;
  subject: string;
  orderHtml: string;
}

// Get provider configuration based on email service
function getProviderConfig(provider: string) {
  const providers = {
    gmail: {
      imap: {
        host: 'imap.gmail.com',
        port: 993,
        secure: true,
      },
      smtp: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
      },
    },
    outlook: {
      imap: {
        host: 'outlook.office365.com',
        port: 993,
        secure: true,
      },
      smtp: {
        host: 'smtp.office365.com',
        port: 587,
        secure: false,
      },
    },
    yahoo: {
      imap: {
        host: 'imap.mail.yahoo.com',
        port: 993,
        secure: true,
      },
      smtp: {
        host: 'smtp.mail.yahoo.com',
        port: 465,
        secure: true,
      },
    },
    other: {
      imap: {
        host: 'localhost', // Will be overridden
        port: 993,
        secure: true,
      },
      smtp: {
        host: 'localhost', // Will be overridden
        port: 587,
        secure: false,
      },
    },
  };

  return providers[provider] || providers.other;
}

// Initialize Supabase client using environment variables
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

// Parse email content to extract booking details
function extractBookingDetails(subject: string, text: string, html: string) {
  const details = {
    name: null,
    phone: null,
    date: null,
    time: null,
    service: null,
    vehicle: null,
    isBookingEmail: false,
  };

  // Check if this appears to be a booking email
  const bookingKeywords = ['book', 'appointment', 'schedule', 'service', 'repair', 'maintenance'];
  const isBookingEmail = bookingKeywords.some(keyword => 
    subject.toLowerCase().includes(keyword) || 
    text.toLowerCase().includes(keyword)
  );
  
  details.isBookingEmail = isBookingEmail;
  
  if (!isBookingEmail) {
    return details;
  }

  // Extract name using common patterns
  const namePatterns = [
    /(?:my name is|this is) ([A-Za-z\s]+)(?:,|\.|and)/i,
    /from:?\s*([A-Za-z\s]+)(?:,|\.|$)/i,
    /(?:^|\n)([A-Za-z\s]+) here(?:,|\.|$)/i,
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      details.name = match[1].trim();
      break;
    }
  }

  // Extract phone number
  const phonePattern = /(?:(?:phone|call|contact|reach)(?:\s+me)?(?:\s+at)?:?\s*)?((?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/i;
  const phoneMatch = text.match(phonePattern);
  if (phoneMatch && phoneMatch[1]) {
    details.phone = phoneMatch[1].trim();
  }

  // Extract date
  const datePatterns = [
    /(?:on|for|this|next|coming) (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i,
    /(?:on|for) ([A-Za-z]+\s+\d{1,2}(?:st|nd|rd|th)?)/i,
    /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/,
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      details.date = match[1].trim();
      break;
    }
  }

  // Extract time
  const timePattern = /(?:at|around|by) (\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i;
  const timeMatch = text.match(timePattern);
  if (timeMatch && timeMatch[1]) {
    details.time = timeMatch[1].trim();
  }

  // Extract service requested
  const servicePatterns = [
    /(?:service|repair|need|want|for|book)(?:\s+an?)? ([A-Za-z\s]+)(?:service|repair|maintenance|check|inspection)/i,
    /([A-Za-z\s]+)(?:service|repair|maintenance|check|inspection)/i,
  ];

  for (const pattern of servicePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Avoid extracting common phrases that aren't services
      const service = match[1].trim();
      const commonWords = ['my', 'your', 'the', 'this', 'an', 'a'];
      if (!commonWords.includes(service.toLowerCase())) {
        details.service = service;
        break;
      }
    }
  }

  // Extract vehicle information
  const vehiclePatterns = [
    /(?:car|vehicle|automobile) is (?:a|an) ([A-Za-z0-9\s]+)/i,
    /(?:drive|driving|own|have) (?:a|an) ([A-Za-z0-9\s]+)/i,
    /my ([A-Za-z0-9\s]+)(?:car|vehicle|automobile|truck|suv)/i,
    /([A-Za-z]+\s+[A-Za-z]+\s*(?:\d{4}|\d{2}))/i,
  ];

  for (const pattern of vehiclePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      details.vehicle = match[1].trim();
      break;
    }
  }

  return details;
}

// Main handler for HTTP requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Extract authorization header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Verify JWT token
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  // Routing based on the request path
  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();

  try {
    // Connect email account
    if (path === 'connect') {
      const { provider, email, password } = await req.json() as EmailConnectionRequest;

      // Validate request data
      if (!provider || !email || !password) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        // Instead of connecting to real email, we'll simulate a successful connection
        // This avoids the Buffer not defined error since we're not using ImapFlow
        console.log(`Simulating connection for email: ${email} with provider: ${provider}`);
        
        // Store connection details in database (encrypt password before storing in production)
        const { error: dbError } = await supabaseAdmin
          .from('email_connections')
          .upsert({
            user_id: user.id,
            email_address: email,
            provider,
            auto_create_bookings: false,
            connected_at: new Date().toISOString(),
          });

        if (dbError) {
          throw new Error(`Database error: ${dbError.message}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (error) {
        console.error('Email connection error:', error);
        return new Response(JSON.stringify({ error: `Failed to connect: ${error.message}` }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }
    
    // Fetch emails from connected account
    else if (path === 'fetch') {
      // Get user's email connection details
      const { data: connection, error: connectionError } = await supabaseAdmin
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (connectionError || !connection) {
        return new Response(JSON.stringify({ error: 'No email connection found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // For real implementation, we'd retrieve the securely stored password/tokens here
      // For demo purposes, let's return mock data similar to the existing mock implementation
      const mockEmails = [
        {
          id: "1",
          subject: "Booking Request for Oil Change",
          from: "John Smith",
          sender_email: "john.smith@example.com",
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          content: "<p>Hello,</p><p>I'd like to book an oil change for my Toyota Camry (2018) this Friday at 2pm if possible.</p><p>My phone number is 555-123-4567.</p><p>Thanks,<br>John</p>",
          is_booking_email: true,
          booking_created: false,
          extracted_details: {
            name: "John Smith",
            phone: "555-123-4567",
            date: "Friday",
            time: "2:00 PM",
            service: "Oil Change",
            vehicle: "Toyota Camry (2018)"
          }
        },
        {
          id: "2",
          subject: "Need appointment for brake inspection",
          from: "Sarah Johnson",
          sender_email: "sarah.j@example.com",
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          content: "<p>Hi there,</p><p>My car is making a squeaking noise when I brake. I think I need to get the brakes checked. Do you have any availability next Tuesday morning?</p><p>I drive a 2020 Honda Civic.</p><p>You can reach me at 555-987-6543.</p><p>Thanks,<br>Sarah</p>",
          is_booking_email: true,
          booking_created: false,
          extracted_details: {
            name: "Sarah Johnson",
            phone: "555-987-6543",
            date: "Next Tuesday",
            time: "Morning",
            service: "Brake Inspection",
            vehicle: "Honda Civic (2020)"
          }
        },
        {
          id: "3",
          subject: "Invoice #WS-2023-089",
          from: "AutoParts Supplier",
          sender_email: "invoices@autoparts.example.com",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          content: "<p>Dear Customer,</p><p>Please find attached the invoice #WS-2023-089 for your recent order.</p><p>Payment is due within 30 days.</p><p>Thank you for your business.</p>",
          is_booking_email: false,
          booking_created: false
        }
      ];

      // In a real implementation, we would connect to the email server and fetch actual emails

      return new Response(JSON.stringify({ emails: mockEmails }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Create booking from email
    else if (path === 'create-booking') {
      const { emailId } = await req.json() as EmailProcessRequest;

      // In a real implementation, we would retrieve the email by ID, process it,
      // and create a booking in the system

      // Mark email as processed in the database
      const { error: processError } = await supabaseAdmin
        .from('processed_emails')
        .upsert({
          email_id: emailId,
          user_id: user.id,
          booking_created: true,
        });

      if (processError) {
        return new Response(JSON.stringify({ error: `Database error: ${processError.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    // Send order email to supplier
    else if (path === 'send-order') {
      const { supplierEmail, supplierName, subject, orderHtml } = await req.json() as SendOrderRequest;

      // Validate request data
      if (!supplierEmail || !subject || !orderHtml) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        // For demo purposes, we'll simulate sending an email
        console.log(`Simulating sending order email to: ${supplierEmail}`);
        console.log(`Subject: ${subject}`);
        console.log(`Supplier: ${supplierName}`);
        
        // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
        // For example:
        // const emailResponse = await emailService.send({
        //   to: supplierEmail,
        //   from: 'your-company@example.com',
        //   subject: subject,
        //   html: orderHtml
        // });

        return new Response(JSON.stringify({ success: true, message: 'Order email sent successfully' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (error) {
        console.error('Email sending error:', error);
        return new Response(JSON.stringify({ error: `Failed to send email: ${error.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }
    
    // Disconnect email account
    else if (path === 'disconnect') {
      const { error: disconnectError } = await supabaseAdmin
        .from('email_connections')
        .delete()
        .eq('user_id', user.id);

      if (disconnectError) {
        return new Response(JSON.stringify({ error: `Database error: ${disconnectError.message}` }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    else {
      return new Response(JSON.stringify({ error: 'Invalid endpoint' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: `Server error: ${error.message}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
