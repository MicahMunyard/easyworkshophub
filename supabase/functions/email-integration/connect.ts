
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
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(oauthConfig.google.clientId)}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.google.redirectUri)}&scope=${encodeURIComponent(oauthConfig.google.scopes.join(' '))}&access_type=offline&prompt=consent`;
    } else if (provider === 'microsoft' || provider === 'outlook') {
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${oauthConfig.microsoft.clientId}&response_type=code&redirect_uri=${encodeURIComponent(oauthConfig.microsoft.redirectUri)}&scope=${encodeURIComponent(oauthConfig.microsoft.scopes.join(' '))}&response_mode=query`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // For development/demo purposes, we'll simulate a successful connection
    // In a real implementation, you would redirect the user to the authUrl
    // and handle the callback with the authorization code
    
    // Check if a connection record already exists
    const { data: existingConnection } = await supabaseClient
      .from('email_connections')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
      
    console.log("Existing connection:", existingConnection ? "found" : "not found");
    
    // Check if the email_connections table exists
    try {
      // Save connection information to database (upsert will create or update)
      const { error: connectionError } = await supabaseClient
        .from('email_connections')
        .upsert({
          user_id: user.id,
          email_address: email,
          provider: provider,
          status: 'connected',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          auto_create_bookings: existingConnection?.auto_create_bookings || false
        }, {
          onConflict: 'user_id'
        });
        
      if (connectionError) {
        console.error("Error saving connection:", connectionError);
        
        if (connectionError.code === "42P01") {
          // Table doesn't exist
          return new Response(
            JSON.stringify({ 
              error: 'Email integration tables not set up properly in the database',
              details: 'The email_connections table does not exist. Please set up the required database tables.'
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          );
        }
        
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
