
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

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

  try {
    // Get the request body
    const { userAccessToken, selectedPageIds, manualPageId } = await req.json();
    
    if (!userAccessToken) {
      return new Response(
        JSON.stringify({ error: "Missing user access token" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the authenticated user from the request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract the JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Now exchange the short-lived token for a long-lived one
    const fbAppId = Deno.env.get('FACEBOOK_APP_ID');
    const fbAppSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    
    if (!fbAppId || !fbAppSecret) {
      return new Response(
        JSON.stringify({ error: "Facebook app credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Exchange the token
    const tokenExchangeUrl = `https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${fbAppId}&client_secret=${fbAppSecret}&fb_exchange_token=${userAccessToken}`;
    
    const fbResponse = await fetch(tokenExchangeUrl);
    
    if (!fbResponse.ok) {
      const errorText = await fbResponse.text();
      console.error("Facebook API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Could not exchange token with Facebook" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const tokenData = await fbResponse.json();
    const longLivedToken = tokenData.access_token;
    
    let pagesToStore = [];
    
    // Handle manual page ID flow
    if (manualPageId) {
      const pageUrl = `https://graph.facebook.com/v17.0/${manualPageId}?fields=id,name,access_token&access_token=${longLivedToken}`;
      const pageResponse = await fetch(pageUrl);
      
      if (!pageResponse.ok) {
        const errorText = await pageResponse.text();
        console.error("Facebook Page API error:", errorText);
        return new Response(
          JSON.stringify({ error: "Could not fetch page details. Please verify the Page ID and your permissions." }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const pageData = await pageResponse.json();
      
      if (!pageData.access_token) {
        return new Response(
          JSON.stringify({ error: "No access token for this page. You may need Full Control access." }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      pagesToStore = [pageData];
    } else {
      // Get the user's managed pages
      const pagesUrl = `https://graph.facebook.com/v17.0/me/accounts?access_token=${longLivedToken}`;
      const pagesResponse = await fetch(pagesUrl);
      
      if (!pagesResponse.ok) {
        const errorText = await pagesResponse.text();
        console.error("Facebook Pages API error:", errorText);
        return new Response(
          JSON.stringify({ error: "Could not fetch Facebook pages" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const pagesData = await pagesResponse.json();
      
      // Filter pages based on user selection if provided
      pagesToStore = selectedPageIds && selectedPageIds.length > 0
        ? pagesData.data.filter(page => selectedPageIds.includes(page.id))
        : pagesData.data;
    }
    
    console.log(`Storing ${pagesToStore.length} selected page(s)...`);
    
    // Store the connections in our database
    for (const page of pagesToStore) {
      // Check if this page connection already exists
      const { data: existingPage } = await supabase
        .from('social_connections')
        .select('id')
        .eq('platform', 'facebook')
        .eq('page_id', page.id)
        .eq('user_id', user.id)
        .single();
        
      if (existingPage) {
        // Update existing connection
        await supabase
          .from('social_connections')
          .update({
            page_name: page.name,
            page_access_token: page.access_token,
            user_access_token: longLivedToken,
            status: 'active',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingPage.id);
      } else {
        // Create new connection
        await supabase
          .from('social_connections')
          .insert({
            user_id: user.id,
            platform: 'facebook',
            page_id: page.id,
            page_name: page.name,
            page_access_token: page.access_token,
            user_access_token: longLivedToken,
            status: 'active'
          });
      }
      
      // Store the page access token for the webhook to use
      await supabase
        .from('facebook_page_tokens')
        .upsert({
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          user_id: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_id'
        });
    }
    
    // Return success
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
