
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Define CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Handle NLP extraction of booking details from email content
async function extractBookingDetails(content: string) {
  // This is a simplified version just for demo
  // In a production environment, you might use a more sophisticated NLP library
  const textContent = content.replace(/<[^>]*>/g, ' ');
  
  return {
    name: extractName(textContent),
    phone: extractPhone(textContent),
    date: extractDate(textContent),
    time: extractTime(textContent),
    service: extractService(textContent),
    vehicle: extractVehicle(textContent)
  };
}

// Simple extractors (placeholder implementations)
function extractName(text: string): string | null {
  const nameMatch = text.match(/(?:name is|I am|this is) ([A-Za-z]+ [A-Za-z]+)/i);
  return nameMatch ? nameMatch[1] : null;
}

function extractPhone(text: string): string | null {
  const phoneMatch = text.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
  return phoneMatch ? phoneMatch[1] : null;
}

function extractDate(text: string): string | null {
  const datePatterns = [
    /(?:on|for) (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i,
    /(?:on|for) (january|february|march|april|may|june|july|august|september|october|november|december) (\d{1,2})(?:rd|th|st|nd)?/i,
    /(?:on|for) (\d{1,2})(?:\/|-)(\d{1,2})(?:\/|-)(\d{2,4})/
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/(?:on|for) /i, '');
    }
  }
  
  return null;
}

function extractTime(text: string): string | null {
  const timeMatch = text.match(/(\d{1,2}(?::\d{2})? ?(?:am|pm))/i);
  return timeMatch ? timeMatch[1] : null;
}

function extractService(text: string): string | null {
  const serviceTypes = [
    'oil change', 'tune up', 'brake repair', 'inspection',
    'tire rotation', 'alignment', 'battery replacement'
  ];
  
  const textLower = text.toLowerCase();
  for (const service of serviceTypes) {
    if (textLower.includes(service)) {
      return service.charAt(0).toUpperCase() + service.slice(1);
    }
  }
  
  return null;
}

function extractVehicle(text: string): string | null {
  const vehicleMatch = text.match(/(?:car is|vehicle is|drive) a (\d{4}|\d{2})? ?([A-Za-z]+) ([A-Za-z0-9]+)/i);
  
  if (vehicleMatch) {
    const year = vehicleMatch[1] || '';
    const make = vehicleMatch[2] || '';
    const model = vehicleMatch[3] || '';
    return `${make} ${model}${year ? ` (${year})` : ''}`.trim();
  }
  
  return null;
}

// Main function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  // Create Supabase client with Admin key for API operations
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  // Get Authorization header from request
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  // Get the JWT token from the Authorization header
  const jwt = authHeader.substring(7);
  
  try {
    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get the user's email connection info
    const { data: connection, error: connectionError } = await supabaseClient
      .from('email_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ 
          error: 'No email connection found. Please set up your email integration.',
          details: connectionError 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Parse request body
    const requestData = req.method === 'POST' ? await req.json() : {};
    const { action = 'fetch-emails' } = requestData;
    
    if (action === 'fetch-emails') {
      // Sample emails for testing (in a real app, these would be fetched from Gmail API)
      const mockEmails = [
        {
          id: 'email1',
          subject: 'Car Service Request',
          from: 'John Doe',
          sender_email: 'johndoe@example.com',
          date: new Date().toISOString(),
          content: '<p>Hello, I am John Doe and I would like to schedule an oil change for my Toyota Camry (2019) on Monday at 10:00 am. My phone number is 555-123-4567.</p>',
          is_booking_email: true,
          booking_created: false,
          extracted_details: await extractBookingDetails('<p>Hello, I am John Doe and I would like to schedule an oil change for my Toyota Camry (2019) on Monday at 10:00 am. My phone number is 555-123-4567.</p>')
        },
        {
          id: 'email2',
          subject: 'Need urgent brake repair',
          from: 'Jane Smith',
          sender_email: 'janesmith@example.com',
          date: new Date().toISOString(),
          content: '<p>My car is a Honda Civic and the brakes are making a terrible noise. Can I bring it in tomorrow at 2:00 pm? - Jane Smith (555-987-6543)</p>',
          is_booking_email: true,
          booking_created: false,
          extracted_details: await extractBookingDetails('<p>My car is a Honda Civic and the brakes are making a terrible noise. Can I bring it in tomorrow at 2:00 pm? - Jane Smith (555-987-6543)</p>')
        },
        {
          id: 'email3',
          subject: 'Newsletter subscription',
          from: 'Auto News',
          sender_email: 'news@autonews.com',
          date: new Date().toISOString(),
          content: '<p>Thank you for subscribing to our weekly newsletter!</p>',
          is_booking_email: false,
          booking_created: false,
          extracted_details: null
        }
      ];
      
      // Check if these emails are already processed
      for (const email of mockEmails) {
        const { data: processed } = await supabaseClient
          .from('processed_emails')
          .select('*')
          .eq('email_id', email.id)
          .eq('user_id', user.id)
          .single();
          
        if (processed) {
          email.booking_created = processed.booking_created;
          email.processing_status = processed.processing_status;
        }
      }
    
      return new Response(
        JSON.stringify({ success: true, emails: mockEmails }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'create-booking') {
      const { emailId } = requestData;
      
      // In a real app, this would fetch the email from your database
      // For demo purposes, we'll create a mock email
      const mockEmail = {
        id: emailId,
        subject: 'Car Service Request',
        from: 'John Doe',
        sender_email: 'johndoe@example.com',
        date: new Date().toISOString(),
        content: '<p>Hello, I am John Doe and I would like to schedule an oil change for my Toyota Camry (2019) on Monday at 10:00 am. My phone number is 555-123-4567.</p>',
        is_booking_email: true,
        extracted_details: await extractBookingDetails('<p>Hello, I am John Doe and I would like to schedule an oil change for my Toyota Camry (2019) on Monday at 10:00 am. My phone number is 555-123-4567.</p>')
      };
      
      const details = mockEmail.extracted_details;
      const bookingDate = new Date().toISOString().split('T')[0]; // Today as fallback
      
      const newBooking = {
        user_id: user.id,
        customer_name: details?.name || "Unknown Customer",
        customer_phone: details?.phone || "",
        service: details?.service || "General Service",
        car: details?.vehicle || "Not specified",
        booking_time: details?.time || "9:00 AM",
        duration: 60,
        status: "pending",
        booking_date: bookingDate,
        notes: `Created from email: ${mockEmail.subject}\n\nOriginal email content:\n${mockEmail.content.replace(/<[^>]*>/g, '')}`
      };
      
      // Insert the new booking
      const { data: booking, error: bookingError } = await supabaseClient
        .from('user_bookings')
        .insert(newBooking)
        .select()
        .single();
        
      if (bookingError) {
        console.error("Error creating booking:", bookingError);
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to create booking', details: bookingError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Update the processed_emails table
      await supabaseClient
        .from('processed_emails')
        .upsert({
          user_id: user.id,
          email_id: emailId,
          booking_created: true,
          processing_status: 'completed',
          processing_notes: `Booking created with ID: ${booking.id}`,
          extracted_data: details,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'email_id,user_id'
        });
      
      return new Response(
        JSON.stringify({ success: true, bookingId: booking.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'send-email') {
      const { to, subject, body } = requestData;
      
      if (!to || !subject || !body) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing required fields (to, subject, body)' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      // In a real app, you'd use the Gmail API to send the email
      // Here, we just simulate a successful send
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email sent to ${to} with subject "${subject}"` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
