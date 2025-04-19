
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
  console.log("Request URL:", req.url);
  console.log("Request method:", req.method);
  
  try {
    // Log environment variables (for debugging)
    console.log("Environment variables available:");
    console.log("GOOGLE_CLIENT_ID:", Deno.env.get('GOOGLE_CLIENT_ID') ? 'Set' : 'Not set');
    console.log("GOOGLE_CLIENT_SECRET:", Deno.env.get('GOOGLE_CLIENT_SECRET') ? 'Set' : 'Not set');
    console.log("GOOGLE_REDIRECT_URI:", Deno.env.get('GOOGLE_REDIRECT_URI') ? 'Set' : 'Not set');
    
    // Parse request body
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
      // Use the client ID directly from environment variable
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      
      // Use the correct redirect URI that's configured in Google Cloud
      const redirectUri = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback';
      
      console.log("Google OAuth configuration:");
      console.log("- Client ID:", googleClientId ? 'Available' : 'Missing');
      console.log("- Redirect URI:", redirectUri);
      
      if (!googleClientId) {
        console.error("Missing Google OAuth configuration");
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error: Missing Google OAuth configuration',
            details: 'The Google client ID is not configured in environment variables.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Create Google OAuth URL with the configured redirect URI
      const scopes = [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/gmail.modify',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];
      
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(googleClientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&access_type=offline&prompt=consent&state=${provider}`;
      console.log("Generated auth URL:", authUrl.substring(0, 100) + '...');
    } else if (provider === 'microsoft' || provider === 'outlook') {
      const microsoftClientId = Deno.env.get('MICROSOFT_CLIENT_ID');
      const redirectUri = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback';
      
      console.log("Microsoft OAuth configuration:");
      console.log("- Client ID:", microsoftClientId ? 'Available' : 'Missing');
      console.log("- Redirect URI:", redirectUri);
      
      if (!microsoftClientId) {
        console.error("Missing Microsoft OAuth configuration");
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error: Missing Microsoft OAuth configuration',
            details: 'The Microsoft client ID is not configured in environment variables.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      const scopes = [
        'offline_access',
        'User.Read',
        'Mail.Read',
        'Mail.Send'
      ];
      
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${microsoftClientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_mode=query&state=${provider}`;
      console.log("Generated auth URL:", authUrl.substring(0, 100) + '...');
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
