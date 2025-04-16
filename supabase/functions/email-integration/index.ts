
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Create Supabase client with environment variables
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  console.log("Email integration function called");
  console.log("SUPABASE_URL:", Deno.env.get('SUPABASE_URL'));
  
  // Verify Supabase URL is available
  if (!Deno.env.get('SUPABASE_URL')) {
    console.error("SUPABASE_URL environment variable is missing");
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing SUPABASE_URL' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

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
    
    // Handle the request based on method and content
    try {
      const requestData = await req.json();
      const { action } = requestData || {};
      
      console.log("Action requested:", action || "fetch emails");
      
      // Check if user has a valid email connection
      const { data: emailConnection, error: connectionError } = await supabaseClient
        .from('email_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'connected')
        .maybeSingle();
        
      if (connectionError) {
        console.error("Error checking email connection:", connectionError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to check email connection',
            details: connectionError
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      if (!emailConnection) {
        return new Response(
          JSON.stringify({ 
            error: 'No email connection found',
            message: 'Please set up your email integration'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      // Handle different actions
      switch (action) {
        case 'create-booking':
          // Implementation for creating booking from email
          // Handle booking creation logic here
          return new Response(
            JSON.stringify({ 
              success: true,
              bookingId: 'mock-booking-id',
              message: 'Booking created successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          );
        
        case 'send-email':
          // Implementation for sending emails
          const { to, subject, body } = requestData;
          // Implement email sending logic here
          return new Response(
            JSON.stringify({ 
              success: true,
              message: 'Email sent successfully'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
          );
          
        default:
          // Default action: Fetch emails
          // For demo purposes, return mock emails
          return new Response(
            JSON.stringify({
              success: true,
              emails: [
                {
                  id: '1',
                  subject: 'Booking Request',
                  from: 'John Smith',
                  sender_email: 'john@example.com',
                  date: new Date().toISOString(),
                  content: 'Hello, I would like to book a service for my car.',
                  is_booking_email: true,
                  booking_created: false,
                  extracted_details: {
                    name: 'John Smith',
                    phone: '555-1234',
                    date: new Date().toISOString().split('T')[0],
                    time: '10:00 AM',
                    service: 'Oil Change',
                    vehicle: 'Toyota Camry'
                  }
                },
                {
                  id: '2',
                  subject: 'Question about services',
                  from: 'Jane Doe',
                  sender_email: 'jane@example.com',
                  date: new Date(Date.now() - 86400000).toISOString(),
                  content: 'Do you offer brake repairs?',
                  is_booking_email: false,
                  booking_created: false
                }
              ]
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
      }
      
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Error processing request',
          details: error instanceof Error ? error.message : String(error)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
  } catch (error) {
    console.error("Error in email-integration function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
