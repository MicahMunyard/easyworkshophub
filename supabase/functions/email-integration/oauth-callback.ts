
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

  console.log("Email integration OAuth callback function called");
  
  // Get Supabase env vars
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing required environment variables");
    return new Response(
      JSON.stringify({ error: 'Server configuration error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Create Supabase client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

  // Parse auth header
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ error: 'Missing or invalid authorization header' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    );
  }

  // Extract token
  const jwt = authHeader.substring(7);
  
  try {
    // Verify user auth
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get callback data
    const requestData = await req.json();
    const { code, provider, state } = requestData;
    
    console.log(`Processing OAuth callback for user ${user.id} with provider ${provider}`);
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    let tokens;
    let email;
    
    // Handle different providers
    if (provider === 'gmail' || provider === 'google') {
      // Exchange code for tokens with Google
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: oauthConfig.google.clientId,
          client_secret: oauthConfig.google.clientSecret,
          redirect_uri: oauthConfig.google.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Google token exchange error:", errorText);
        return new Response(
          JSON.stringify({ error: `Failed to exchange authorization code: ${errorText}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      tokens = await tokenResponse.json();
      console.log("Received tokens from Google:", tokens.access_token ? "Access token present" : "No access token");
      
      // Get user email from Google profile
      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      
      if (!profileResponse.ok) {
        console.error("Failed to get Google profile");
        return new Response(
          JSON.stringify({ error: 'Failed to retrieve user profile from Google' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      const profile = await profileResponse.json();
      email = profile.email;
      console.log(`Retrieved email ${email} from Google profile`);
      
    } else if (provider === 'outlook' || provider === 'microsoft') {
      // Exchange code for tokens with Microsoft
      // Similar implementation as Google but with Microsoft endpoints
      return new Response(
        JSON.stringify({ error: 'Microsoft integration not implemented yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 501 }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Store the tokens securely in the database
    try {
      // First encrypt the tokens
      const encryptedTokens = JSON.stringify(tokens); // In production, encrypt this properly
      
      // Update the email_connections table with the new connection info
      const { error: connectionError } = await supabaseAdmin
        .from('email_connections')
        .upsert({
          user_id: user.id,
          email_address: email,
          provider,
          status: 'connected',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Don't store tokens in this table for security
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
      
      // Store the tokens in a separate, more secure table
      const { error: tokensError } = await supabaseAdmin
        .from('email_connection_tokens')
        .upsert({
          user_id: user.id,
          tokens: encryptedTokens,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
      
      if (tokensError) {
        console.error("Error saving tokens:", tokensError);
        return new Response(
          JSON.stringify({ error: 'Failed to save authentication tokens', details: tokensError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          email,
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
    console.error("Error processing OAuth callback:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
