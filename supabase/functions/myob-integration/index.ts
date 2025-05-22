
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const MYOB_CLIENT_ID = Deno.env.get("MYOB_CLIENT_ID") as string;
const MYOB_CLIENT_SECRET = Deno.env.get("MYOB_CLIENT_SECRET") as string;
const MYOB_WEBHOOK_KEY = Deno.env.get("MYOB_WEBHOOK_KEY") || "";
const REDIRECT_URI = "https://app.workshopbase.com.au/integrations/myob/oauth";
const MYOB_AUTH_URL = "https://secure.myob.com/oauth2/account/authorize";
const MYOB_TOKEN_URL = "https://secure.myob.com/oauth2/v1/authorize";
const MYOB_API_BASE_URL = "https://api.myob.com/accountright/";

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    console.log(`[DEBUG] Request received for path: ${path}`);
    console.log(`[DEBUG] Request method: ${req.method}`);
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Authentication URL generator
    if (path === "get-auth-url") {
      console.log("[DEBUG] Processing get-auth-url request");
      
      // Debug environment variables
      console.log("[DEBUG] MYOB_CLIENT_ID exists:", !!MYOB_CLIENT_ID);
      console.log("[DEBUG] MYOB_CLIENT_ID length:", MYOB_CLIENT_ID?.length || 0);
      console.log("[DEBUG] MYOB_CLIENT_ID value:", MYOB_CLIENT_ID ? `${MYOB_CLIENT_ID.substring(0, 8)}...` : "NOT SET");
      console.log("[DEBUG] MYOB_CLIENT_SECRET exists:", !!MYOB_CLIENT_SECRET);
      console.log("[DEBUG] REDIRECT_URI:", REDIRECT_URI);
      console.log("[DEBUG] MYOB_AUTH_URL:", MYOB_AUTH_URL);
      
      if (!MYOB_CLIENT_ID) {
        console.error("[ERROR] MYOB_CLIENT_ID is not set!");
        return new Response(
          JSON.stringify({ error: "MYOB_CLIENT_ID environment variable is not set" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const scopes = "CompanyFile.Read CompanyFile.Write Invoice.Read Invoice.Write";
      
      const authUrl = `${MYOB_AUTH_URL}?client_id=${MYOB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scopes)}`;
      
      console.log("[DEBUG] Generated auth URL:", authUrl);
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // OAuth callback handling
    if (path === "oauth-callback") {
      console.log("[DEBUG] Processing oauth-callback request");
      
      const params = await req.json();
      const code = params.code;
      const businessId = params.businessId; // This is the company file ID
      
      console.log("[DEBUG] OAuth callback params:", { code: !!code, businessId });
      
      if (!code) {
        console.error("[ERROR] No authorization code provided");
        return new Response(
          JSON.stringify({ error: "No authorization code provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Debug environment variables for token exchange
      console.log("[DEBUG] Token exchange - CLIENT_ID exists:", !!MYOB_CLIENT_ID);
      console.log("[DEBUG] Token exchange - CLIENT_SECRET exists:", !!MYOB_CLIENT_SECRET);
      console.log("[DEBUG] Token exchange - REDIRECT_URI:", REDIRECT_URI);
      console.log("[DEBUG] Token exchange - TOKEN_URL:", MYOB_TOKEN_URL);
      
      // Exchange code for access token
      const formData = new URLSearchParams();
      formData.append("client_id", MYOB_CLIENT_ID);
      formData.append("client_secret", MYOB_CLIENT_SECRET);
      formData.append("scope", "CompanyFile.Read CompanyFile.Write Invoice.Read Invoice.Write");
      formData.append("code", code);
      formData.append("redirect_uri", REDIRECT_URI);
      formData.append("grant_type", "authorization_code");
      
      console.log("[DEBUG] Form data for token exchange:", Object.fromEntries(formData.entries()));
      
      const tokenResponse = await fetch(MYOB_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
      });
      
      console.log("[DEBUG] Token response status:", tokenResponse.status);
      console.log("[DEBUG] Token response headers:", Object.fromEntries(tokenResponse.headers.entries()));
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("[ERROR] Error exchanging code for token:", errorText);
        console.error("[ERROR] Token response status:", tokenResponse.status);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for token", details: errorText }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const tokenData = await tokenResponse.json();
      console.log("[DEBUG] Token data received:", { ...tokenData, access_token: "***", refresh_token: "***" });
      
      // Get user ID from the request
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        console.error("[ERROR] No authorization header");
        return new Response(
          JSON.stringify({ error: "No authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error("[ERROR] Invalid user token:", userError);
        return new Response(
          JSON.stringify({ error: "Invalid user token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("[DEBUG] User authenticated:", user.id);
      
      // Store the tokens in the database
      const { error: storeError } = await supabase
        .from("accounting_integrations")
        .upsert({
          user_id: user.id,
          provider: "myob",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          tenant_id: businessId || tokenData.businessId || null,
          connected_at: new Date().toISOString(),
          status: "active"
        });
      
      if (storeError) {
        console.error("[ERROR] Error storing token:", storeError);
        return new Response(
          JSON.stringify({ error: "Failed to store integration data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("[DEBUG] Integration stored successfully");
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Token refresh endpoint
    if (path === "refresh-token") {
      console.log("[DEBUG] Processing refresh-token request");
      
      const { provider, refreshToken, userId } = await req.json();
      
      if (provider !== "myob" || !refreshToken || !userId) {
        console.error("[ERROR] Invalid refresh parameters");
        return new Response(
          JSON.stringify({ error: "Invalid refresh parameters" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const formData = new URLSearchParams();
      formData.append("client_id", MYOB_CLIENT_ID);
      formData.append("client_secret", MYOB_CLIENT_SECRET);
      formData.append("refresh_token", refreshToken);
      formData.append("grant_type", "refresh_token");
      
      const refreshResponse = await fetch(MYOB_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
      });
      
      if (!refreshResponse.ok) {
        const errorText = await refreshResponse.text();
        console.error("[ERROR] Error refreshing token:", errorText);
        
        // Update status to disconnected if refresh fails
        await supabase
          .from("accounting_integrations")
          .update({ 
            status: "disconnected",
            last_error: `Token refresh failed: ${errorText}`
          })
          .eq("user_id", userId)
          .eq("provider", "myob");
        
        return new Response(
          JSON.stringify({ error: "Failed to refresh token", details: errorText }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const tokenData = await refreshResponse.json();
      
      // Update the tokens in the database
      const { error: updateError } = await supabase
        .from("accounting_integrations")
        .update({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          status: "active",
          last_error: null
        })
        .eq("user_id", userId)
        .eq("provider", "myob");
      
      if (updateError) {
        console.error("[ERROR] Error updating tokens:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update token data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get webhook URL endpoint
    if (path === "get-webhook-url") {
      console.log("[DEBUG] Processing get-webhook-url request");
      
      const webhookUrl = `${SUPABASE_URL}/functions/v1/myob-integration/webhook`;
      
      return new Response(
        JSON.stringify({ 
          webhookUrl,
          note: "Configure this URL in your MYOB Developer app under Webhooks section" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync invoice to MYOB
    if (path === "sync-invoice") {
      console.log("[DEBUG] Processing sync-invoice request");
      
      try {
        const { invoice, provider } = await req.json();
        console.log("[DEBUG] Invoice sync requested for provider:", provider);
        console.log("[DEBUG] Invoice data:", JSON.stringify(invoice));
  
        if (provider !== 'myob') {
          throw new Error(`Provider ${provider} not supported`);
        }
  
        // Get user ID from the request
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          console.error("[ERROR] No authorization header in sync request");
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const token = authHeader.replace("Bearer ", "");
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  
        if (userError || !user) {
          console.error("[ERROR] Invalid user token in sync request:", userError);
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        console.log("[DEBUG] User authenticated for sync:", user.id);
        
        // Retrieve the MYOB access token and business ID from the database
        const { data: integration, error: integrationError } = await supabase
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', provider)
          .single();
  
        if (integrationError) {
          console.error('[ERROR] Error retrieving integration for sync:', integrationError);
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve integration details' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        if (!integration?.access_token || !integration?.tenant_id) {
          console.error('[ERROR] Missing integration credentials:', { 
            hasAccessToken: !!integration?.access_token, 
            hasTenantId: !!integration?.tenant_id 
          });
          return new Response(
            JSON.stringify({ success: false, error: 'Not connected to MYOB' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const myobAccessToken = integration.access_token;
        const businessId = integration.tenant_id;
        
        console.log('[DEBUG] Retrieved integration data:', { 
          businessId,
          tokenExists: !!myobAccessToken,
          tokenLength: myobAccessToken?.length
        });
  
        // Create Base64 encoded username:password for cftoken header
        // In a real scenario, you would use actual credentials from the user
        const cfTokenValue = btoa("administrator:");
        console.log('[DEBUG] Created cftoken header');
  
        // Map WorkshopBase invoice to MYOB invoice format
        const myobInvoice = {
          Number: invoice.invoiceNumber,
          Date: invoice.date,
          DueDate: invoice.dueDate,
          Customer: {
            Name: invoice.customerName,
            UID: invoice.customerId // Assuming this is the UID in MYOB
          },
          Lines: invoice.items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitPrice: item.unitPrice,
            Total: item.total,
          })),
          Subtotal: invoice.subtotal,
          TotalTax: invoice.taxTotal,
          TotalAmount: invoice.total,
          Status: "Open" // Adjust based on MYOB status options
        };
        
        console.log('[DEBUG] Mapped invoice data to MYOB format');
        console.log('[DEBUG] MYOB API URL:', `${MYOB_API_BASE_URL}${businessId}/Sale/Invoice`);
  
        // Call the MYOB API to create the invoice with correct headers
        // Updated headers based on the MYOB documentation
        console.log('[DEBUG] Sending request to MYOB API');
        const myobResponse = await fetch(`${MYOB_API_BASE_URL}${businessId}/Sale/Invoice`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${myobAccessToken}`,
            'x-myobapi-cftoken': cfTokenValue,
            'x-myobapi-key': MYOB_CLIENT_ID,
            'x-myobapi-version': 'v2',
            'Accept-Encoding': 'gzip,deflate',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(myobInvoice)
        });
        
        console.log('[DEBUG] MYOB API response status:', myobResponse.status);
        console.log('[DEBUG] MYOB API response headers:', Object.fromEntries(myobResponse.headers.entries()));
  
        if (!myobResponse.ok) {
          const errorText = await myobResponse.text();
          console.error('[ERROR] Error creating invoice in MYOB:', errorText);
          return new Response(
            JSON.stringify({ success: false, error: `Failed to create invoice in MYOB: ${errorText}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const myobData = await myobResponse.json();
        console.log('[DEBUG] MYOB API response data:', myobData);
        
        const externalId = myobData.UID || myobData.Id;
        console.log('[DEBUG] Extracted external ID:', externalId);
  
        return new Response(
          JSON.stringify({ success: true, externalId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
  
      } catch (error) {
        console.error("[ERROR] Failed to sync invoice", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Default response for unsupported paths
    console.log(`[DEBUG] Unsupported path: ${path}`);
    return new Response(
      JSON.stringify({ error: "Unsupported path" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("[ERROR] Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
