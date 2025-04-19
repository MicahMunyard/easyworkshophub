
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

  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return new Response(
      JSON.stringify({ error: 'Missing authorization code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  // Determine the provider from the state parameter
  const provider = state || 'gmail';
  
  try {
    let tokenResponse;
    let userEmail = '';
    
    // Exchange code for tokens based on provider
    if (provider === 'gmail' || provider === 'google') {
      // Google OAuth token exchange
      tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: oauthConfig.google.clientId,
          client_secret: oauthConfig.google.clientSecret,
          redirect_uri: oauthConfig.google.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Google token exchange error: ${JSON.stringify(errorData)}`);
      }
      
      const tokens = await tokenResponse.json();
      
      // Get user profile to get email address
      const userProfileResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
      
      if (userProfileResponse.ok) {
        const userProfile = await userProfileResponse.json();
        userEmail = userProfile.email;
      }
      
      // Return a success response
      return new Response(
        JSON.stringify({
          success: true,
          provider: 'gmail',
          email: userEmail,
          message: 'Successfully authenticated with Google'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else if (provider === 'microsoft' || provider === 'outlook') {
      // Microsoft OAuth token exchange
      tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: oauthConfig.microsoft.clientId,
          client_secret: oauthConfig.microsoft.clientSecret,
          redirect_uri: oauthConfig.microsoft.redirectUri,
          grant_type: 'authorization_code',
        }).toString(),
      });
      
      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json();
        throw new Error(`Microsoft token exchange error: ${JSON.stringify(errorData)}`);
      }
      
      const tokens = await tokenResponse.json();
      
      // Get user profile to get email address
      const userProfileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });
      
      if (userProfileResponse.ok) {
        const userProfile = await userProfileResponse.json();
        userEmail = userProfile.mail || userProfile.userPrincipalName;
      }
      
      // Return a success response
      return new Response(
        JSON.stringify({
          success: true,
          provider: 'outlook',
          email: userEmail,
          message: 'Successfully authenticated with Microsoft'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new Response(
      JSON.stringify({ 
        error: 'OAuth authentication failed', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
