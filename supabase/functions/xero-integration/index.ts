
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const XERO_CLIENT_ID = Deno.env.get("XERO_CLIENT_ID") as string;
const XERO_CLIENT_SECRET = Deno.env.get("XERO_CLIENT_SECRET") as string;
const REDIRECT_URI = "https://app.workshopbase.com/integrations/xero/oauth";

serve(async (req) => {
  // Handle CORS for preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();
    
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // OAuth callback handling
    if (path === "oauth-callback") {
      const params = url.searchParams;
      const code = params.get("code");
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: "No authorization code provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Exchange code for access token
      const tokenResponse = await fetch("https://identity.xero.com/connect/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`)}`
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI
        })
      });
      
      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Error exchanging code for token:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const tokenData = await tokenResponse.json();
      
      // Get user ID from the request
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: "No authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const token = authHeader.replace("Bearer ", "");
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        return new Response(
          JSON.stringify({ error: "Invalid user token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Store the tokens in the database
      const { error: storeError } = await supabase
        .from("accounting_integrations")
        .upsert({
          user_id: user.id,
          provider: "xero",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          tenant_id: tokenData.tenantId || null,
          connected_at: new Date().toISOString(),
          status: "active"
        });
      
      if (storeError) {
        console.error("Error storing token:", storeError);
        return new Response(
          JSON.stringify({ error: "Failed to store integration data" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Webhook handling
    if (path === "webhook") {
      const webhookData = await req.json();
      console.log("Received webhook from Xero:", webhookData);
      
      // Handle invoice payment status updates
      if (webhookData.eventType === "INVOICE_UPDATED" || webhookData.eventType === "PAYMENT") {
        // Process the invoice update and sync back to WorkshopBase
        const invoiceId = webhookData.resourceId;
        
        // Update invoice status in WorkshopBase if it was paid
        if (webhookData.status === "PAID" || webhookData.paymentStatus === "PAID") {
          // Find the corresponding internal invoice
          const { data: invoice, error: findError } = await supabase
            .from("user_invoices")
            .select("*")
            .eq("xero_invoice_id", invoiceId)
            .single();
          
          if (!findError && invoice) {
            // Update the invoice status to paid
            const { error: updateError } = await supabase
              .from("user_invoices")
              .update({ status: "paid", updated_at: new Date().toISOString() })
              .eq("id", invoice.id);
            
            if (updateError) {
              console.error("Failed to update invoice status:", updateError);
            }
          }
        }
      }
      
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Default response for unsupported paths
    return new Response(
      JSON.stringify({ error: "Unsupported path" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
