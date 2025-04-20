
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

  // Parse URL to get the path
  const url = new URL(req.url);
  const path = url.pathname.split('/').pop();
  
  console.log("Email integration function called with path:", path);
  console.log("Full URL:", url.toString());
  
  try {
    // Route requests to the appropriate handler
    switch(path) {
      case 'connect':
        return await handleConnectEndpoint(req);
      case 'disconnect':
        return await handleDisconnectEndpoint(req);
      case 'oauth-callback':
        return await handleOAuthCallbackEndpoint(req);
      default:
        return await handleMainEndpoint(req);
    }
  } catch (error) {
    console.error("Error routing request:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
        path: path,
        url: url.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handle connect endpoint
async function handleConnectEndpoint(req: Request) {
  console.log("Email integration connect endpoint called");
  
  try {
    // Verify environment variables
    const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
    const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
    
    // Log available environment variables (for debugging)
    const envVars = {
      GOOGLE_CLIENT_ID: googleClientId ? 'Set' : 'Not set',
      GOOGLE_CLIENT_SECRET: googleClientSecret ? 'Set' : 'Not set',
      SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set',
      SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Not set',
    };
    
    console.log("Environment variables status:", envVars);
    
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
      // Check if Google OAuth configuration is available
      if (!googleClientId || !googleClientSecret) {
        console.error("Missing Google OAuth configuration");
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error: Missing Google OAuth configuration',
            details: 'The Google client ID or client secret is not configured in environment variables.'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Use the correct redirect URI that's configured in Google Cloud
      const redirectUri = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback';
      
      console.log("Google OAuth configuration:");
      console.log("- Client ID:", googleClientId ? 'Available' : 'Missing');
      console.log("- Client Secret:", googleClientSecret ? 'Available' : 'Missing');
      console.log("- Redirect URI:", redirectUri);
      
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
      const microsoftClientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
      const redirectUri = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback';
      
      console.log("Microsoft OAuth configuration:");
      console.log("- Client ID:", microsoftClientId ? 'Available' : 'Missing');
      console.log("- Client Secret:", microsoftClientSecret ? 'Available' : 'Missing');
      console.log("- Redirect URI:", redirectUri);
      
      if (!microsoftClientId || !microsoftClientSecret) {
        console.error("Missing Microsoft OAuth configuration");
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error: Missing Microsoft OAuth configuration',
            details: 'The Microsoft client ID or client secret is not configured in environment variables.'
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
}

// Handle disconnect endpoint
async function handleDisconnectEndpoint(req: Request) {
  console.log("Email integration disconnect endpoint called");
  
  // Make sure environment variables are available
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  // Verify Supabase URL is available
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables");
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing Supabase configuration' }),
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
    
  } catch (error) {
    console.error("Error in disconnect function:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Handle OAuth callback endpoint
async function handleOAuthCallbackEndpoint(req: Request) {
  console.log("Email integration OAuth callback endpoint called");
  
  // Make sure environment variables are available
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase environment variables");
    return new Response(
      JSON.stringify({ error: 'Server configuration error: Missing Supabase configuration' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }

  // Create Supabase client with Admin key for API operations
  const supabaseClient = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
  );

  try {
    const { code, provider } = await req.json();
    
    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: provider' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get Authorization header from request for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Get the JWT token from the Authorization header
    const jwt = authHeader.substring(7);
    
    // Verify user authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);
    
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Exchange authorization code for access token
    let tokenResponse;
    let userEmail = '';
    
    try {
      if (provider === 'gmail' || provider === 'google') {
        // Use Google OAuth configuration for token exchange
        const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
        const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/oauth-callback';
        
        if (!googleClientId || !googleClientSecret) {
          throw new Error("Missing Google OAuth credentials");
        }
        
        // Exchange authorization code for token
        const tokenUrl = 'https://oauth2.googleapis.com/token';
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: googleClientId,
            client_secret: googleClientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
        });
        
        tokenResponse = await response.json();
        
        if (!response.ok) {
          console.error("Failed to exchange authorization code:", tokenResponse);
          throw new Error(`Failed to exchange authorization code: ${tokenResponse.error_description || tokenResponse.error || 'Unknown error'}`);
        }
        
        // Get user info to get email
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        const userInfo = await userInfoResponse.json();
        userEmail = userInfo.email;
        
      } else if (provider === 'microsoft' || provider === 'outlook') {
        // Similar implementation for Microsoft
        // ... implementation for Microsoft OAuth token exchange
      } else {
        throw new Error("Unsupported provider");
      }
      
      // Store tokens in database
      const { error: dbError } = await supabaseClient
        .from('email_connections')
        .upsert({
          user_id: user.id,
          provider: provider,
          email_address: userEmail,
          access_token: tokenResponse.access_token,
          refresh_token: tokenResponse.refresh_token,
          token_expires_at: new Date(Date.now() + (tokenResponse.expires_in * 1000)).toISOString(),
          status: 'connected',
          connected_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
        
      if (dbError) {
        console.error("Error saving token:", dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: userEmail,
          message: 'Email connected successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (tokenError: any) {
      console.error("Error exchanging authorization code:", tokenError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to exchange authorization code', 
          details: tokenError instanceof Error ? tokenError.message : String(tokenError)
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error("Error in OAuth callback:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : String(error)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Handle main endpoint
async function handleMainEndpoint(req: Request) {
  console.log("Email integration main endpoint called");
  
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
    
    // Default: Handle fetching emails or other actions
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
}
