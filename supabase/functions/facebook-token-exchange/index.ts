
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Facebook app credentials
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    const redirectUri = 'https://app.workshopbase.com.au/facebook/callback'; // Update this
    
    // Exchange code for token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v17.0/oauth/access_token?` +
      `client_id=${appId}&` +
      `client_secret=${appSecret}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `code=${code}`,
      { method: 'GET' }
    );
    
    if (!tokenResponse.ok) {
      throw new Error(`Failed to exchange token: ${await tokenResponse.text()}`);
    }
    
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;
    
    // Get user pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v17.0/me/accounts?access_token=${accessToken}`,
      { method: 'GET' }
    );
    
    if (!pagesResponse.ok) {
      throw new Error(`Failed to get pages: ${await pagesResponse.text()}`);
    }
    
    const pagesData = await pagesResponse.json();
    const pages = pagesData.data;
    
    // Store each page and subscribe to webhooks
    const storedPages = [];
    
    for (const page of pages) {
      const pageId = page.id;
      const pageName = page.name;
      const pageAccessToken = page.access_token;
      
      // Store page access token
      const { data: pageData, error: pageError } = await supabase
        .from('facebook_page_tokens')
        .upsert({
          user_id: userId,
          page_id: pageId,
          page_name: pageName,
          access_token: pageAccessToken,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (pageError) {
        console.error('Error storing page token:', pageError);
        continue;
      }
      
      // Create social connection record
      const { data: connData, error: connError } = await supabase
        .from('social_connections')
        .upsert({
          user_id: userId,
          platform: 'facebook',
          page_id: pageId,
          page_name: pageName,
          status: 'active',
          connected_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (connError) {
        console.error('Error creating social connection:', connError);
        continue;
      }
      
      // Subscribe to webhooks for this page
      try {
        const subscribeResult = await subscribeToPageWebhooks(pageId, pageAccessToken);
        storedPages.push({
          id: pageId,
          name: pageName,
          subscribed: subscribeResult.success
        });
      } catch (error) {
        console.error('Error subscribing to webhooks:', error);
        storedPages.push({
          id: pageId,
          name: pageName,
          subscribed: false,
          error: error.message
        });
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      pages: storedPages 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error processing token exchange:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Function to subscribe to page webhooks
async function subscribeToPageWebhooks(pageId, pageAccessToken) {
  try {
    // Update this to your Supabase Edge Function URL
    const webhookUrl = 'https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/facebook-webhook';
    
    // Subscribe to webhooks for this page
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${pageId}/subscribed_apps?access_token=${pageAccessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscribed_fields: 'messages,messaging_postbacks,message_deliveries,message_reads'
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to subscribe to webhooks: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error subscribing to webhooks:', error);
    throw error;
  }
}
