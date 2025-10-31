import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const XERO_CLIENT_ID = Deno.env.get("XERO_CLIENT_ID") as string;
const XERO_CLIENT_SECRET = Deno.env.get("XERO_CLIENT_SECRET") as string;
const XERO_WEBHOOK_KEY = Deno.env.get("XERO_WEBHOOK_KEY") as string;
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
    
    // Get auth URL endpoint
    if (path === "get-auth-url") {
      console.log("[DEBUG] Processing get-auth-url request");
      
      if (!XERO_CLIENT_ID) {
        console.error("[ERROR] XERO_CLIENT_ID is not set!");
        return new Response(
          JSON.stringify({ error: "XERO_CLIENT_ID environment variable is not set" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const scopes = "offline_access accounting.transactions accounting.contacts accounting.settings";
      const state = globalThis.crypto.randomUUID();
      
      const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${XERO_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}&state=${state}`;
      
      console.log("[DEBUG] Generated Xero auth URL:", authUrl);
      
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // OAuth callback handling
    if (path === "oauth-callback") {
      const params = await req.json();
      const code = params.code;
      
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
      // Get the webhook signature from the headers
      const xeroSignature = req.headers.get("x-xero-signature");
      
      if (!xeroSignature) {
        console.error("No Xero signature found in headers");
        return new Response(
          JSON.stringify({ error: "Missing signature header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Get the raw request body to verify the signature
      const rawBody = await req.text();
      
      console.log("Received webhook from Xero with signature:", xeroSignature);
      console.log("Webhook payload (first 100 chars):", rawBody.substring(0, 100));
      
      if (!XERO_WEBHOOK_KEY) {
        console.error("XERO_WEBHOOK_KEY environment variable is not set");
        return new Response(
          JSON.stringify({ error: "Webhook key not configured" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify the signature using HMAC-SHA256
      try {
        const hmac = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(XERO_WEBHOOK_KEY),
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign", "verify"]
        );
        
        const signature = Array.from(
          new Uint8Array(
            await crypto.subtle.sign(
              "HMAC",
              hmac,
              new TextEncoder().encode(rawBody)
            )
          )
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");

        console.log("Calculated signature:", signature.toLowerCase());
        console.log("Received signature:", xeroSignature.toLowerCase());

        // Compare signatures (case-insensitive)
        if (signature.toLowerCase() !== xeroSignature.toLowerCase()) {
          console.error("Webhook signature validation failed");
          return new Response(
            JSON.stringify({ error: "Invalid webhook signature", calculated: signature.toLowerCase(), received: xeroSignature.toLowerCase() }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } else {
          console.log("Webhook signature validation succeeded");
        }
      } catch (signError) {
        console.error("Error during signature verification:", signError);
        return new Response(
          JSON.stringify({ error: "Signature verification error" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Parse the webhook payload
      try {
        const webhookData = JSON.parse(rawBody);
        console.log("Parsed webhook data:", JSON.stringify(webhookData).substring(0, 200) + "...");
        
        // Process the webhook event
        try {
          // Handle invoice payment status updates
          if (webhookData.events && webhookData.events.length > 0) {
            for (const event of webhookData.events) {
              console.log(`Processing event: ${event.eventType} for resource: ${event.resourceId}`);
              
              if (event.eventType === "INVOICE.UPDATED" || 
                  event.eventType === "PAYMENT.CREATED") {
                // Get the resource details
                const resourceId = event.resourceId;
                
                // Find the corresponding internal invoice
                const { data: invoice, error: findError } = await supabase
                  .from("user_invoices")
                  .select("*")
                  .eq("xero_invoice_id", resourceId)
                  .single();
                
                if (findError) {
                  console.error("Error finding invoice:", findError);
                } else if (invoice) {
                  console.log(`Found matching invoice: ${invoice.id}`);
                  
                  // If this is a payment and it would change the invoice to paid
                  if (event.eventType === "PAYMENT.CREATED" && 
                      event.eventData && 
                      event.eventData.status === "PAID") {
                    
                    // Update the invoice status to paid
                    const { error: updateError } = await supabase
                      .from("user_invoices")
                      .update({ 
                        status: "paid", 
                        updated_at: new Date().toISOString(),
                        last_synced_at: new Date().toISOString()
                      })
                      .eq("id", invoice.id);
                    
                    if (updateError) {
                      console.error("Failed to update invoice status:", updateError);
                    } else {
                      console.log(`Invoice ${invoice.id} marked as paid based on Xero webhook`);
                    }
                  }
                } else {
                  console.log(`No matching invoice found for Xero invoice ID: ${resourceId}`);
                }
              }
            }
          }
        } catch (processError) {
          console.error("Error processing webhook event:", processError);
        }
      } catch (parseError) {
        console.error("Error parsing webhook payload:", parseError);
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Always return 200 OK to Xero to acknowledge receipt
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get webhook URL endpoint (helper for UI to show the webhook URL)
    if (path === "get-webhook-url") {
      // Return the webhook URL to be configured in Xero
      const webhookUrl = `${SUPABASE_URL}/functions/v1/xero-integration/webhook`;
      
      return new Response(
        JSON.stringify({ 
          webhookUrl,
          note: "Configure this URL in your Xero Developer app under Webhooks section" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sync invoice to Xero
    if (path === "sync-invoice") {
      try {
        const { invoice, provider } = await req.json();
  
        if (provider !== 'xero') {
          throw new Error(`Provider ${provider} not supported`);
        }
  
        // Get the user ID from the request
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
  
        // Retrieve the Xero access token and tenant ID from the database
        const { data: integration, error: integrationError } = await supabase
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', provider)
          .single();
  
        if (integrationError) {
          console.error('Error retrieving integration:', integrationError);
          return new Response(
            JSON.stringify({ error: 'Failed to retrieve integration details' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        if (!integration?.access_token || !integration?.tenant_id) {
          return new Response(
            JSON.stringify({ success: false, error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const xeroAccessToken = integration.access_token;
        const xeroTenantId = integration.tenant_id;
  
        // Map WorkshopBase invoice to Xero invoice format
        const xeroInvoice = {
          Type: 'ACCREC', // Sales invoice
          Contact: {
            Name: invoice.customerName
          },
          Date: invoice.date,
          DueDate: invoice.dueDate,
          LineItems: invoice.items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitAmount: item.unitPrice,
            AccountCode: '200', // Replace with your sales account code
          }),
          ),
          Reference: invoice.invoiceNumber,
          SubTotal: invoice.subtotal,
          TotalTax: invoice.taxTotal,
          Total: invoice.total,
          Status: 'AUTHORISED' // or DRAFT
        };
  
        // Call the Xero API to create or update the invoice
        const isUpdate = Boolean(invoice.xeroInvoiceId);
        const xeroResponse = await fetch(
          isUpdate 
            ? `https://api.xero.com/api.xro/2.0/Invoices/${invoice.xeroInvoiceId}`
            : 'https://api.xero.com/api.xro/2.0/Invoices',
          {
            method: isUpdate ? 'POST' : 'POST',
            headers: {
              'Authorization': `Bearer ${xeroAccessToken}`,
              'Xero-Tenant-Id': xeroTenantId,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ Invoices: [xeroInvoice] })
          }
        );
  
        if (!xeroResponse.ok) {
          const errorText = await xeroResponse.text();
          console.error('Error syncing invoice to Xero:', errorText);
          
          // Check if token expired (401)
          if (xeroResponse.status === 401) {
            // Attempt token refresh
            const refreshResponse = await fetch("https://identity.xero.com/connect/token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${btoa(`${XERO_CLIENT_ID}:${XERO_CLIENT_SECRET}`)}`
              },
              body: new URLSearchParams({
                grant_type: "refresh_token",
                refresh_token: integration.refresh_token
              })
            });

            if (refreshResponse.ok) {
              const newTokenData = await refreshResponse.json();
              
              // Update tokens in database
              await supabase
                .from("accounting_integrations")
                .update({
                  access_token: newTokenData.access_token,
                  refresh_token: newTokenData.refresh_token,
                  expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString()
                })
                .eq('user_id', user.id)
                .eq('provider', provider);

              return new Response(
                JSON.stringify({ success: false, error: 'Token expired. Please try again.' }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
          
          return new Response(
            JSON.stringify({ success: false, error: `Failed to sync invoice to Xero: ${errorText}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const xeroData = await xeroResponse.json();
        const externalId = xeroData.Invoices[0].InvoiceID;
  
        // Update the local invoice record with the Xero invoice ID
        const { error: updateError } = await supabase
          .from('user_invoices')
          .update({
            xero_invoice_id: externalId,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', invoice.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Failed to update invoice with Xero ID:', updateError);
          // Still return success since the invoice was created in Xero
        }

        return new Response(
          JSON.stringify({ success: true, externalId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
  
      } catch (error) {
        console.error("Failed to sync invoice", error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
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
