
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

  console.log("Email integration connect endpoint called");
  
  try {
    const { provider } = await req.json();
    
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
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
    } else {
      return new Response(
        JSON.stringify({ error: 'Unsupported provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Return the authentication URL
    return new Response(
      JSON.stringify({ 
        success: true, 
        auth_url: authUrl,
        message: 'OAuth authentication URL generated' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error("Error in connect endpoint:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
