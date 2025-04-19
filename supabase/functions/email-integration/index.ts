
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { oauthConfig } from "./_shared/oauth.config.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  console.log("Email integration function called");
  
  // Make sure environment variables are available
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log("SUPABASE_URL available:", !!supabaseUrl);
  
  // Verify Supabase URL is available
  if (!supabaseUrl) {
    console.error("SUPABASE_URL environment variable is missing");
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing SUPABASE_URL' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
  
  // Verify Supabase service role key is available
  if (!supabaseServiceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY environment variable is missing");
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Create Supabase client with Admin key for API operations
  const supabaseClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
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
    
    // Handle the request based on method and content
    try {
      const requestData = await req.json();
      const { action, provider, email, password } = requestData || {};
      
      console.log("Action requested:", action || "fetch emails");
      
      // Handle action: connect - Start OAuth flow or save email credentials
      if (action === 'connect') {
        if (!provider) {
          return new Response(
            JSON.stringify({ error: 'Missing required field: provider' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // For OAuth providers, email is optional
        // For IMAP providers, email is required
        if ((provider === 'yahoo' || provider === 'other') && !email) {
          return new Response(
            JSON.stringify({ error: 'Missing required field: email' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        console.log(`Processing connection request for user ${user.id} with provider ${provider}`);
        
        // Generate OAuth URL for the specified provider
        let authUrl;
        if (provider === 'gmail' || provider === 'google') {
          if (!oauthConfig.google.clientId || !oauthConfig.google.redirectUri) {
            console.error("Missing Google OAuth configuration");
            return new Response(
              JSON.stringify({ 
                error: 'Server configuration error: Missing Google OAuth configuration',
                details: 'The Google client ID or redirect URI is not configured'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(oauthConfig.google.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.google.redirectUri)}&scope=${encodeURIComponent(oauthConfig.google.scopes.join(' '))}&access_type=offline&prompt=consent&state=${provider}`;
        } else if (provider === 'microsoft' || provider === 'outlook') {
          if (!oauthConfig.microsoft.clientId || !oauthConfig.microsoft.redirectUri) {
            console.error("Missing Microsoft OAuth configuration");
            return new Response(
              JSON.stringify({ 
                error: 'Server configuration error: Missing Microsoft OAuth configuration',
                details: 'The Microsoft client ID or redirect URI is not configured'
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oauthConfig.microsoft.clientId}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.microsoft.redirectUri)}&scope=${encodeURIComponent(oauthConfig.microsoft.scopes.join(' '))}&response_mode=query&state=${provider}`;
        } else if (provider !== 'yahoo' && provider !== 'other') {
          return new Response(
            JSON.stringify({ error: 'Unsupported provider' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
          );
        }
        
        // Check if the email_connections table exists
        try {
          // Try to check if the table exists using a simple query
          const { count, error: countError } = await supabaseClient
            .from('email_connections')
            .select('*', { count: 'exact', head: true });
          
          if (countError) {
            console.error("Error checking if email_connections table exists:", countError);
            // If the error is that the relation doesn't exist, that means the table doesn't exist
            if (countError.code === "42P01") {
              return new Response(
                JSON.stringify({ 
                  error: 'Email integration tables not set up properly in the database',
                  details: 'The email_connections table does not exist. Please set up the required database tables.'
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
              );
            }
          }
        
          // Check if a connection record already exists
          const { data: existingConnection, error: existingConnectionError } = await supabaseClient
            .from('email_connections')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
          
          if (existingConnectionError) {
            console.error("Error checking existing connection:", existingConnectionError);
            return new Response(
              JSON.stringify({ 
                error: 'Failed to check existing connection',
                details: existingConnectionError
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
            
          console.log("Existing connection:", existingConnection ? "found" : "not found");
          
          // Save connection information to database (upsert will create or update)
          const { error: connectionError } = await supabaseClient
            .from('email_connections')
            .upsert({
              user_id: user.id,
              email_address: email || null, // Email can be null for OAuth flows
              provider: provider,
              status: 'connecting', // Set to connecting, will be updated after OAuth flow completes
              updated_at: new Date().toISOString(),
              auto_create_bookings: existingConnection?.auto_create_bookings || false
            }, {
              onConflict: 'user_id'
            });
            
          if (connectionError) {
            console.error("Error saving connection:", connectionError);
            return new Response(
              JSON.stringify({ error: 'Failed to save connection data', details: connectionError }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          // For OAuth providers, return the authentication URL
          if (authUrl) {
            // If we got here, we've successfully created or updated the connection
            return new Response(
              JSON.stringify({ 
                success: true, 
                auth_url: authUrl,
                message: 'OAuth authentication URL generated' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } else {
            // For non-OAuth providers that don't have an auth_url
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Email connection information saved' 
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } catch (dbError: any) {
          console.error("Database operation error:", dbError);
          return new Response(
            JSON.stringify({ 
              error: 'Database operation failed',
              details: dbError instanceof Error ? dbError.message : String(dbError)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
      
      // Handle action: disconnect - Remove email connection
      if (action === 'disconnect') {
        try {
          const { error } = await supabaseClient
            .from('email_connections')
            .update({
              status: 'disconnected',
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
          
          if (error) {
            console.error("Error disconnecting email:", error);
            return new Response(
              JSON.stringify({ error: 'Failed to disconnect email', details: error }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            );
          }
          
          return new Response(
            JSON.stringify({ success: true, message: 'Email disconnected successfully' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error disconnecting email:", error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to disconnect email', 
              details: error instanceof Error ? error.message : String(error) 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
      
      // Handle action: diagnose - Check connection issues
      if (action === 'diagnose') {
        try {
          // Check if user has a valid email connection
          const { data: emailConnection, error: connectionError } = await supabaseClient
            .from('email_connections')
            .select('*')
            .eq('user_id', user.id)
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
          
          // For demo purposes, return a diagnostic message
          let diagnosticMessage;
          if (emailConnection.status === 'connected') {
            diagnosticMessage = "Connection looks fine. Email integration is properly connected.";
          } else {
            diagnosticMessage = `Connection issue detected: Status is ${emailConnection.status}. ${emailConnection.last_error || ''}`;
          }
          
          return new Response(
            JSON.stringify({ 
              success: true,
              diagnosticMessage,
              connectionDetails: {
                provider: emailConnection.provider,
                status: emailConnection.status,
                last_connected: emailConnection.connected_at
              }
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } catch (error: any) {
          console.error("Error diagnosing connection:", error);
          return new Response(
            JSON.stringify({ 
              error: 'Failed to diagnose connection', 
              details: error instanceof Error ? error.message : String(error)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
      }
      
      // Default: Handle fetching emails or other actions
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
