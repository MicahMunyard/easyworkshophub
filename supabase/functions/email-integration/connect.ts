
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { oauthConfig } from "../_shared/oauth.config.ts";

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

  console.log("Email integration connect function called");
  
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
    
    const requestData = await req.json();
    const { provider, email, password } = requestData;
    
    if (!provider || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing connection request for user ${user.id} with email ${email} and provider ${provider}`);
    
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
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(oauthConfig.google.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.google.redirectUri)}&scope=${encodeURIComponent(oauthConfig.google.scopes.join(' '))}&access_type=offline&prompt=consent`;
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
      
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oauthConfig.microsoft.clientId}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.microsoft.redirectUri)}&scope=${encodeURIComponent(oauthConfig.microsoft.scopes.join(' '))}&response_mode=query`;
    } else {
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
          email_address: email,
          provider: provider,
          status: 'connected', // For demo purposes, set to connected right away
          connected_at: new Date().toISOString(),
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
      
      // If we got here, we've successfully created or updated the connection
      return new Response(
        JSON.stringify({ 
          success: true, 
          auth_url: authUrl,
          message: 'Email connected successfully' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
    
  } catch (error) {
    console.error("Error processing connection request:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
