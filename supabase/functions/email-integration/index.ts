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
    // Log environment variable status (for debugging)
    console.log("Environment variables check:");
    console.log("- GOOGLE_CLIENT_ID:", Deno.env.get('GOOGLE_CLIENT_ID') ? 'Available' : 'Not available');
    console.log("- GOOGLE_CLIENT_SECRET:", Deno.env.get('GOOGLE_CLIENT_SECRET') ? 'Available' : 'Not available');
    console.log("- MICROSOFT_CLIENT_ID:", Deno.env.get('MICROSOFT_CLIENT_ID') ? 'Available' : 'Not available');
    console.log("- MICROSOFT_CLIENT_SECRET:", Deno.env.get('MICROSOFT_CLIENT_SECRET') ? 'Available' : 'Not available');
    console.log("- SUPABASE_URL:", Deno.env.get('SUPABASE_URL') ? 'Available' : 'Not available');
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Available' : 'Not available');
    
    // Route requests to the appropriate handler
    switch(path) {
      case 'connect':
        return await handleConnectEndpoint(req);
      case 'disconnect':
        return await handleDisconnectEndpoint(req);
      case 'oauth-callback':
        return await handleOAuthCallbackEndpoint(req);
      case 'send-reply':
        return await handleSendReplyEndpoint(req);
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
    // Create a debug object with more information
    const debugInfo = {
      environmentVariables: {
        GOOGLE_CLIENT_ID: Deno.env.get('GOOGLE_CLIENT_ID') ? 'Set' : 'Not set',
        GOOGLE_CLIENT_SECRET: Deno.env.get('GOOGLE_CLIENT_SECRET') ? 'Set' : 'Not set',
        MICROSOFT_CLIENT_ID: Deno.env.get('MICROSOFT_CLIENT_ID') ? 'Set' : 'Not set',
        MICROSOFT_CLIENT_SECRET: Deno.env.get('MICROSOFT_CLIENT_SECRET') ? 'Set' : 'Not set',
        SUPABASE_URL: Deno.env.get('SUPABASE_URL') ? 'Set' : 'Not set',
        SUPABASE_SERVICE_ROLE_KEY: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Set' : 'Not set',
      },
      requestInfo: {
        method: req.method,
        url: req.url,
        hasAuthHeader: req.headers.has('Authorization'),
      }
    };
    
    console.log("Debug information:", JSON.stringify(debugInfo, null, 2));
    
    // Parse request body
    let provider;
    try {
      const body = await req.json();
      provider = body.provider;
      console.log("Request body parsed successfully, provider:", provider);
    } catch (error) {
      console.error("Error parsing request body:", error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body', 
          details: 'Could not parse JSON body',
          debug: debugInfo
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!provider) {
      return new Response(
        JSON.stringify({ 
          error: 'Missing required field: provider',
          debug: debugInfo 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Generate OAuth URL for the specified provider
    let authUrl;
    
    if (provider === 'gmail' || provider === 'google') {
      // Check for Google OAuth configuration
      const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
      const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
      
      // If the Google environment variables are missing, return a specific error for Google
      if (!googleClientId || !googleClientSecret) {
        console.error("Missing Google OAuth configuration");
        return new Response(
          JSON.stringify({ 
            error: 'Server configuration error: Missing Google OAuth configuration',
            details: 'The Google client ID or client secret is not configured in environment variables.',
            debug: debugInfo,
            manualConfig: {
              GOOGLE_CLIENT_ID: '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com',
              GOOGLE_CLIENT_SECRET_LENGTH: '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'.length,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // *** IMPORTANT: Update the redirectUri to match what's configured in Google Cloud Console ***
      const redirectUri = 'https://app.workshopbase.com.au/email/callback';
      
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
      console.log("Generated Google auth URL:", authUrl.substring(0, 100) + '...');
      
    } else if (provider === 'microsoft' || provider === 'outlook') {
      // Check for Microsoft OAuth configuration
      const microsoftClientId = Deno.env.get('MICROSOFT_CLIENT_ID');
      const microsoftClientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
      
      // If the Microsoft environment variables are missing, return a specific error
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
      
      // Update the redirectUri to match what's configured in Azure portal
      const redirectUri = 'https://app.workshopbase.com.au/email/callback';
      
      console.log("Microsoft OAuth configuration:");
      console.log("- Client ID:", microsoftClientId ? 'Available' : 'Missing');
      console.log("- Client Secret:", microsoftClientSecret ? 'Available' : 'Missing');
      console.log("- Redirect URI:", redirectUri);
      
      // Create Microsoft OAuth URL with the configured redirect URI
      const scopes = [
        'offline_access',
        'User.Read',
        'Mail.ReadWrite',
        'Mail.Send'
      ];
      
      // Microsoft uses a different OAuth flow than Google
      authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${encodeURIComponent(microsoftClientId)}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes.join(' '))}&response_mode=query&state=${provider}`;
      console.log("Generated Microsoft auth URL:", authUrl.substring(0, 100) + '...');
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
      console.error("Missing or invalid authorization header");
      return new Response(
        JSON.stringify({ 
          error: 'Missing or invalid authorization header', 
          details: 'The authorization header is required and must start with Bearer.'
        }),
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
        const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID') || '736177477108-a7cfbd4dcv3pqfk2jaolbm3j4fse0s9h.apps.googleusercontent.com';
        const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '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';
        const redirectUri = 'https://app.workshopbase.com.au/email/callback';
        
        if (!googleClientId || !googleClientSecret) {
          throw new Error("Missing Google OAuth credentials");
        }
        
        console.log("Exchanging code for token with Google OAuth...");
        
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
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Token exchange failed:", response.status, errorText);
          throw new Error(`Failed to exchange authorization code: ${errorText}`);
        }
        
        tokenResponse = await response.json();
        console.log("Token exchange successful");
        
        // Get user info to get email
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error("Failed to fetch user info:", errorText);
          throw new Error(`Failed to get user info: ${errorText}`);
        }
        
        const userInfo = await userInfoResponse.json();
        userEmail = userInfo.email;
        console.log(`Retrieved email: ${userEmail}`);
        
      } else if (provider === 'microsoft' || provider === 'outlook') {
        const microsoftClientId = Deno.env.get('MICROSOFT_CLIENT_ID');
        const microsoftClientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
        const redirectUri = 'https://app.workshopbase.com.au/email/callback';
        
        if (!microsoftClientId || !microsoftClientSecret) {
          throw new Error("Missing Microsoft OAuth credentials");
        }
        
        console.log("Exchanging code for token with Microsoft OAuth...");
        
        const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
        const response = await fetch(tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: microsoftClientId,
            client_secret: microsoftClientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }).toString(),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Token exchange failed:", response.status, errorText);
          throw new Error(`Failed to exchange authorization code: ${errorText}`);
        }
        
        tokenResponse = await response.json();
        console.log("Token exchange successful");
        
        // Get user info to get email
        const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        if (!userInfoResponse.ok) {
          const errorText = await userInfoResponse.text();
          console.error("Failed to fetch user info:", errorText);
          throw new Error(`Failed to get user info: ${errorText}`);
        }
        
        const userInfo = await userInfoResponse.json();
        userEmail = userInfo.mail || userInfo.userPrincipalName;
        console.log(`Retrieved email: ${userEmail}`);
      } else {
        throw new Error("Unsupported provider");
      }
      
      console.log("Storing tokens in database for user:", user.id);
      
      // Updated upsert to use proper conflict key
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

// Handle main endpoint - Updated to fetch actual Gmail emails instead of mock data
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

    // Parse request body to get folder (inbox, sent, etc)
    let folder = "inbox";
    try {
      const body = await req.json();
      folder = body.folder || "inbox";
      console.log("Requested folder:", folder);
    } catch (error) {
      console.log("No folder specified in request body, defaulting to inbox");
    }
    
    // Get user's email connection
    const { data: emailConnection, error: connectionError } = await supabaseClient
      .from('email_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'connected')
      .single();
      
    if (connectionError || !emailConnection) {
      console.log("No email connection found or user not connected. Returning mock data.");
      // Return mock emails for demo purposes if no connection exists
      return new Response(
        JSON.stringify({
          success: true,
          emails: [
            {
              id: '1',
              subject: 'Booking Request (Demo)',
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
              subject: 'Question about services (Demo)',
              from: 'Jane Doe',
              sender_email: 'jane@example.com',
              date: new Date(Date.now() - 86400000).toISOString(),
              content: 'Do you offer brake repairs?',
              is_booking_email: false,
              booking_created: false
            }
          ],
          message: 'Using demo emails because no email connection was found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Found email connection:", emailConnection.provider, "for email:", emailConnection.email_address);
    
    // Check if token is expired and needs refresh
    if (emailConnection.token_expires_at && new Date(emailConnection.token_expires_at) <= new Date()) {
      console.log("Access token expired, refreshing...");
      const newTokens = await refreshAccessToken(emailConnection);
      
      if (!newTokens) {
        return new Response(
          JSON.stringify({ 
            error: 'Failed to refresh access token',
            details: 'The refresh token may have expired or be invalid'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
        );
      }
      
      // Update connection with new tokens
      const { error: updateError } = await supabaseClient
        .from('email_connections')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token || emailConnection.refresh_token,
          token_expires_at: new Date(Date.now() + (newTokens.expires_in * 1000)).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (updateError) {
        console.error("Error updating tokens:", updateError);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to update access tokens',
            details: updateError.message
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }
      
      // Use updated access token
      emailConnection.access_token = newTokens.access_token;
    }
    
    // Fetch emails based on provider
    let emails = [];
    if (emailConnection.provider === 'google' || emailConnection.provider === 'gmail') {
      emails = await fetchGmailEmails(emailConnection.access_token, folder);
    } else if (emailConnection.provider === 'microsoft' || emailConnection.provider === 'outlook') {
      emails = await fetchOutlookEmails(emailConnection.access_token, folder);
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Unsupported email provider',
          provider: emailConnection.provider
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Get processed email statuses
    const { data: processed, error: processedError } = await supabaseClient
      .from('processed_emails')
      .select('email_id, booking_created, processing_status')
      .eq('user_id', user.id);
      
    if (processedError) {
      console.error("Error fetching processed emails:", processedError);
    }
    
    // Merge processing status with emails
    const emailsWithStatus = emails.map(email => {
      const processedEmail = processed?.find(p => p.email_id === email.id);
      return {
        ...email,
        booking_created: processedEmail ? processedEmail.booking_created : false,
        processing_status: processedEmail ? processedEmail.processing_status : 'pending'
      };
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        emails: emailsWithStatus
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

// Fetch emails from Gmail API
async function fetchGmailEmails(accessToken: string, folder: string = 'inbox'): Promise<any[]> {
  console.log("Fetching Gmail emails from folder:", folder);
  
  try {
    // First, get the message IDs of the most recent emails
    const labelId = folder === 'sent' ? 'SENT' : folder === 'junk' ? 'SPAM' : 'INBOX';
    const maxResults = 20; // Limit to 20 emails for performance
    
    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=${labelId}&maxResults=${maxResults}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.text();
      console.error("Gmail API error:", messagesResponse.status, errorData);
      throw new Error(`Gmail API returned status ${messagesResponse.status}: ${errorData}`);
    }
    
    const { messages } = await messagesResponse.json();
    
    if (!messages || messages.length === 0) {
      console.log("No messages found in", folder);
      return [];
    }
    
    console.log(`Found ${messages.length} messages, fetching details...`);
    
    // Fetch the full details of each email message
    const emails = await Promise.all(
      messages.map(async (message: { id: string }) => {
        const messageResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
