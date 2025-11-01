import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") as string;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") as string;
const XERO_CLIENT_ID = Deno.env.get("XERO_CLIENT_ID") as string;
const XERO_CLIENT_SECRET = Deno.env.get("XERO_CLIENT_SECRET") as string;
const XERO_WEBHOOK_KEY = Deno.env.get("XERO_WEBHOOK_KEY") as string;
const REDIRECT_URI = "https://app.workshopbase.com.au/integrations/xero/oauth";

// ============= Helper Functions =============

async function refreshXeroToken(supabaseClient: any, userId: string, provider: string, integration: any) {
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

  if (!refreshResponse.ok) {
    throw new Error("Failed to refresh token");
  }

  const newTokenData = await refreshResponse.json();
  
  await supabaseClient
    .from("accounting_integrations")
    .update({
      access_token: newTokenData.access_token,
      refresh_token: newTokenData.refresh_token,
      expires_at: new Date(Date.now() + newTokenData.expires_in * 1000).toISOString()
    })
    .eq('user_id', userId)
    .eq('provider', provider);

  return newTokenData.access_token;
}

async function fetchAccountMapping(supabaseClient: any, userId: string) {
  const { data: mapping, error } = await supabaseClient
    .from('xero_account_mappings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching account mapping:', error);
    return null;
  }

  return mapping;
}

async function logSyncOperation(
  supabaseClient: any,
  userId: string,
  resourceType: string,
  resourceId: string | null,
  operation: string,
  status: 'success' | 'error',
  xeroId: string | null,
  requestPayload: any,
  responseData: any,
  errorMessage: string | null = null
) {
  await supabaseClient
    .from('xero_sync_history')
    .insert({
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      operation: operation,
      status: status,
      xero_id: xeroId,
      request_payload: requestPayload,
      response_data: responseData,
      error_message: errorMessage,
      synced_at: new Date().toISOString()
    });
}

async function callXeroAPI(
  supabaseClient: any,
  userId: string,
  provider: string,
  integration: any,
  url: string,
  method: string = 'GET',
  body: any = null
) {
  let accessToken = integration.access_token;
  const tenantId = integration.tenant_id;
  
  const makeRequest = async (token: string) => {
    const options: RequestInit = {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Xero-Tenant-Id': tenantId,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }
    
    return await fetch(url, options);
  };
  
  let response = await makeRequest(accessToken);
  
  if (response.status === 401) {
    accessToken = await refreshXeroToken(supabaseClient, userId, provider, integration);
    response = await makeRequest(accessToken);
  }
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  
  return await response.json();
}

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
      console.log("[DEBUG] Starting oauth-callback processing");
      
      const params = await req.json();
      const code = params.code;
      
      console.log("[DEBUG] Received authorization code:", code ? "present" : "missing");
      
      if (!code) {
        console.error("[ERROR] No authorization code provided");
        return new Response(
          JSON.stringify({ error: "No authorization code provided" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Get user ID from the request first
      const authHeader = req.headers.get("Authorization");
      console.log("[DEBUG] Authorization header:", authHeader ? "present" : "missing");
      
      if (!authHeader) {
        console.error("[ERROR] No authorization header");
        return new Response(
          JSON.stringify({ error: "No authorization header" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Create authenticated Supabase client for user-scoped operations
      const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
      
      if (userError || !user) {
        console.error("[ERROR] Invalid user token:", userError);
        return new Response(
          JSON.stringify({ error: "Invalid user token" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      console.log("[DEBUG] User authenticated:", user.id);
      
      // Exchange code for access token
      console.log("[DEBUG] Exchanging authorization code for access token");
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
        console.error("[ERROR] Failed to exchange code for token:", errorText);
        return new Response(
          JSON.stringify({ error: "Failed to exchange code for token" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const tokenData = await tokenResponse.json();
      console.log("[DEBUG] Token exchange successful, expires in:", tokenData.expires_in);
      
      // Get tenant ID from Xero /connections endpoint
      console.log("[DEBUG] Fetching tenant ID from Xero connections endpoint");
      let tenantId = null;
      
      try {
        const connectionsResponse = await fetch("https://api.xero.com/connections", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (connectionsResponse.ok) {
          const connections = await connectionsResponse.json();
          console.log("[DEBUG] Retrieved", connections.length, "Xero connections");
          
          if (connections && connections.length > 0) {
            // Use the first tenant ID (most common case is single tenant)
            tenantId = connections[0].tenantId;
            console.log("[DEBUG] Using tenant ID:", tenantId);
          } else {
            console.warn("[WARN] No Xero connections found for this user");
          }
        } else {
          const errorText = await connectionsResponse.text();
          console.error("[ERROR] Failed to fetch connections:", errorText);
        }
      } catch (connectionError) {
        console.error("[ERROR] Exception fetching tenant ID:", connectionError);
      }
      
      // Store the tokens in the database using authenticated client
      console.log("[DEBUG] Storing integration data in database");
      const { error: storeError } = await supabaseUser
        .from("accounting_integrations")
        .upsert({
          user_id: user.id,
          provider: "xero",
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
          tenant_id: tenantId,
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
      
      console.log("[DEBUG] OAuth callback completed successfully");
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
      
      try {
        // Use Deno's built-in crypto API for HMAC-SHA256
        const encoder = new TextEncoder();
        const keyData = encoder.encode(XERO_WEBHOOK_KEY);
        const messageData = encoder.encode(rawBody);
        
        const cryptoKey = await crypto.subtle.importKey(
          "raw",
          keyData,
          { name: "HMAC", hash: "SHA-256" },
          false,
          ["sign"]
        );
        
        const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
        const calculatedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));

        console.log("Calculated signature:", calculatedSignature);
        console.log("Received signature:", xeroSignature);

        if (calculatedSignature !== xeroSignature) {
          console.error("Webhook signature validation failed");
          return new Response(
            JSON.stringify({ error: "Invalid webhook signature" }),
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
      
      try {
        const webhookData = JSON.parse(rawBody);
        console.log("Parsed webhook data:", JSON.stringify(webhookData).substring(0, 200) + "...");
        
        try {
          if (webhookData.events && webhookData.events.length > 0) {
            for (const event of webhookData.events) {
              console.log(`Processing event: ${event.eventType} for resource: ${event.resourceId}`);
              
              if (event.eventType === "INVOICE.UPDATED" || 
                  event.eventType === "PAYMENT.CREATED") {
                const resourceId = event.resourceId;
                
                const { data: invoice, error: findInvoiceError } = await supabase
                  .from("user_invoices")
                  .select("*")
                  .eq("xero_invoice_id", resourceId)
                  .maybeSingle();
                
                if (findInvoiceError) {
                  console.error("Error finding invoice:", findInvoiceError);
                } else if (invoice) {
                  console.log(`Found matching invoice: ${invoice.id}`);
                  
                  if (event.eventType === "PAYMENT.CREATED" && 
                      event.eventData && 
                      event.eventData.status === "PAID") {
                    
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
                  const { data: bill, error: findBillError } = await supabase
                    .from("user_bills")
                    .select("*")
                    .eq("xero_bill_id", resourceId)
                    .maybeSingle();
                  
                  if (findBillError) {
                    console.error("Error finding bill:", findBillError);
                  } else if (bill) {
                    console.log(`Found matching bill: ${bill.id}`);
                    
                    if (event.eventType === "PAYMENT.CREATED") {
                      const { error: updateError } = await supabase
                        .from("user_bills")
                        .update({ 
                          status: "paid", 
                          updated_at: new Date().toISOString(),
                          xero_synced_at: new Date().toISOString()
                        })
                        .eq("id", bill.id);
                      
                      if (updateError) {
                        console.error("Failed to update bill status:", updateError);
                      } else {
                        console.log(`Bill ${bill.id} marked as paid based on Xero webhook`);
                      }
                    }
                  } else {
                    console.log(`No matching invoice or bill found for Xero resource ID: ${resourceId}`);
                  }
                }
              } else if (event.eventType === "CONTACT.UPDATED" || event.eventType === "CONTACT.CREATED") {
                console.log(`Contact event received: ${event.eventType} - will be handled in Phase 4`);
              } else if (event.eventType === "ITEM.UPDATED" || event.eventType === "ITEM.CREATED") {
                console.log(`Item event received: ${event.eventType} - will be handled in Phase 4`);
              }
            }
          }
        } catch (processError) {
          console.error("Error processing webhook event:", processError);
        }
        
        return new Response(
          JSON.stringify({ status: "received" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (parseError) {
        console.error("Error parsing webhook data:", parseError);
        return new Response(
          JSON.stringify({ error: "Failed to parse webhook data" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Get webhook URL endpoint
    if (path === "get-webhook-url") {
      const webhookUrl = "https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/xero-integration/webhook";
      
      return new Response(
        JSON.stringify({ 
          webhookUrl,
          note: "Configure this URL in your Xero Developer app under Webhooks section" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch Chart of Accounts endpoint
    if (path === "fetch-chart-of-accounts") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .maybeSingle();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const data = await callXeroAPI(
          supabaseUser,
          user.id,
          'xero',
          integration,
          'https://api.xero.com/api.xro/2.0/Accounts',
          'GET'
        );

        const accounts = data.Accounts
          .filter((account: any) => account.Status === 'ACTIVE')
          .map((account: any) => ({
            accountID: account.AccountID,
            code: account.Code,
            name: account.Name,
            type: account.Type,
            taxType: account.TaxType,
            description: account.Description,
            class: account.Class,
            status: account.Status,
            enablePaymentsToAccount: account.EnablePaymentsToAccount
          }));

        return new Response(
          JSON.stringify({ accounts }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error("Error in fetch-chart-of-accounts:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch Tax Rates endpoint
    if (path === "fetch-tax-rates") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .maybeSingle();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const data = await callXeroAPI(
          supabaseUser,
          user.id,
          'xero',
          integration,
          'https://api.xero.com/api.xro/2.0/TaxRates',
          'GET'
        );

        const taxRates = data.TaxRates
          .filter((rate: any) => rate.Status === 'ACTIVE')
          .map((rate: any) => ({
            name: rate.Name,
            taxType: rate.TaxType,
            displayTaxRate: rate.DisplayTaxRate,
            effectiveRate: rate.EffectiveRate,
            status: rate.Status
          }));

        return new Response(
          JSON.stringify({ taxRates }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error("Error in fetch-tax-rates:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Save Account Mapping endpoint
    if (path === "save-account-mapping") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const requestBody = await req.json();
        const mapping = requestBody.mapping || requestBody; // Support both wrapped and unwrapped
        
        console.log('Received mapping data:', JSON.stringify(requestBody, null, 2));
        console.log('Extracted mapping:', JSON.stringify(mapping, null, 2));

        // Transform camelCase to snake_case for database
        const dbMapping = {
          user_id: user.id,
          invoice_account_code: mapping.invoiceAccountCode || mapping.invoice_account_code,
          cash_payment_account_code: mapping.cashPaymentAccountCode || mapping.cash_payment_account_code,
          bank_payment_account_code: mapping.bankPaymentAccountCode || mapping.bank_payment_account_code,
          credit_account_code: mapping.creditAccountCode || mapping.credit_account_code,
          bill_account_code: mapping.billAccountCode || mapping.bill_account_code,
          bill_cash_payment_account_code: mapping.billCashPaymentAccountCode || mapping.bill_cash_payment_account_code,
          bill_bank_payment_account_code: mapping.billBankPaymentAccountCode || mapping.bill_bank_payment_account_code,
          supplier_credit_account_code: mapping.supplierCreditAccountCode || mapping.supplier_credit_account_code,
          invoice_tax_code: mapping.invoiceTaxCode || mapping.invoice_tax_code,
          invoice_tax_free_code: mapping.invoiceTaxFreeCode || mapping.invoice_tax_free_code,
          bill_tax_code: mapping.billTaxCode || mapping.bill_tax_code,
          bill_tax_free_code: mapping.billTaxFreeCode || mapping.bill_tax_free_code,
          inventory_asset_account_code: mapping.inventoryAssetAccountCode || mapping.inventory_asset_account_code,
          inventory_cogs_account_code: mapping.inventoryCOGSAccountCode || mapping.inventory_cogs_account_code,
          inventory_sales_account_code: mapping.inventorySalesAccountCode || mapping.inventory_sales_account_code,
          is_configured: mapping.isConfigured !== undefined ? mapping.isConfigured : true,
          updated_at: new Date().toISOString()
        };

        console.log('Transformed to dbMapping:', JSON.stringify(dbMapping, null, 2));

        // Validate required fields using the transformed names
        if (!dbMapping.invoice_account_code || !dbMapping.invoice_tax_code) {
          return new Response(
            JSON.stringify({ error: 'Missing required account mappings' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      const { data, error } = await supabaseUser
        .from('xero_account_mappings')
        .upsert(dbMapping, {
          onConflict: 'user_id'
        })
        .select()
        .maybeSingle();

        if (error) {
          console.error('Error saving account mapping:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to save account mapping' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, mapping: data }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error("Error in save-account-mapping:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync Bill endpoint
    if (path === "sync-bill") {
      try {
        const { bill } = await req.json();

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .maybeSingle();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const mapping = await fetchAccountMapping(supabaseUser, user.id);
        if (!mapping || !mapping.is_configured) {
          return new Response(
            JSON.stringify({ error: 'Account mapping not configured' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: billItems, error: itemsError } = await supabaseUser
          .from('user_bill_items')
          .select('*')
          .eq('bill_id', bill.id);

        if (itemsError || !billItems) {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch bill items' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const xeroBill = {
          Type: 'ACCPAY',
          Contact: {
            Name: bill.supplier_name
          },
          Date: bill.bill_date,
          DueDate: bill.due_date || bill.bill_date,
          LineItems: billItems.map((item: any) => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitAmount: item.unit_price,
            AccountCode: item.account_code || mapping.bill_account_code,
            TaxType: item.tax_rate > 0 ? mapping.bill_tax_code : mapping.bill_tax_free_code
          })),
          Reference: bill.bill_number,
          Status: bill.status === 'draft' ? 'DRAFT' : 'AUTHORISED'
        };

        const isUpdate = Boolean(bill.xero_bill_id);
        const xeroUrl = isUpdate 
          ? `https://api.xero.com/api.xro/2.0/Invoices/${bill.xero_bill_id}`
          : 'https://api.xero.com/api.xro/2.0/Invoices';

        try {
          const xeroData = await callXeroAPI(
            supabaseUser,
            user.id,
            'xero',
            integration,
            xeroUrl,
            'POST',
            { Invoices: [xeroBill] }
          );

          const xeroBillId = xeroData.Invoices[0].InvoiceID;

          const { error: updateError } = await supabaseUser
            .from('user_bills')
            .update({
              xero_bill_id: xeroBillId,
              xero_synced_at: new Date().toISOString(),
              last_sync_error: null
            })
            .eq('id', bill.id);

          if (updateError) {
            console.error('Failed to update bill with Xero ID:', updateError);
          }

          await logSyncOperation(
            supabaseUser,
            user.id,
            'bill',
            bill.id,
            isUpdate ? 'update' : 'create',
            'success',
            xeroBillId,
            xeroBill,
            xeroData,
            null
          );

          return new Response(
            JSON.stringify({ success: true, xeroBillId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (apiError) {
          console.error('Error syncing bill to Xero:', apiError);
          
          await logSyncOperation(
            supabaseUser,
            user.id,
            'bill',
            bill.id,
            isUpdate ? 'update' : 'create',
            'error',
            null,
            xeroBill,
            null,
            apiError.message
          );

          await supabaseUser
            .from('user_bills')
            .update({ last_sync_error: apiError.message })
            .eq('id', bill.id);

          return new Response(
            JSON.stringify({ success: false, error: `Failed to sync bill to Xero: ${apiError.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      } catch (error) {
        console.error("Error in sync-bill:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync Bill Payment endpoint
    if (path === "sync-bill-payment") {
      try {
        const { billId, paymentAmount, paymentDate, paymentAccountCode } = await req.json();

        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: bill, error: billError } = await supabaseUser
          .from('user_bills')
          .select('*')
          .eq('id', billId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (billError || !bill || !bill.xero_bill_id) {
          return new Response(
            JSON.stringify({ error: 'Bill not found or not synced to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .maybeSingle();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const mapping = await fetchAccountMapping(supabaseUser, user.id);
        if (!mapping || !mapping.is_configured) {
          return new Response(
            JSON.stringify({ error: 'Account mapping not configured' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const xeroPayment = {
          Invoice: {
            InvoiceID: bill.xero_bill_id
          },
          Account: {
            Code: paymentAccountCode || mapping.bill_bank_payment_account_code
          },
          Date: paymentDate || new Date().toISOString().split('T')[0],
          Amount: paymentAmount
        };

        try {
          const xeroData = await callXeroAPI(
            supabaseUser,
            user.id,
            'xero',
            integration,
            'https://api.xero.com/api.xro/2.0/Payments',
            'POST',
            { Payments: [xeroPayment] }
          );

          const paymentId = xeroData.Payments[0].PaymentID;

          await supabaseUser
            .from('user_bills')
            .update({
              status: 'paid',
              updated_at: new Date().toISOString()
            })
            .eq('id', billId);

          await logSyncOperation(
            supabaseUser,
            user.id,
            'bill_payment',
            billId,
            'create',
            'success',
            paymentId,
            xeroPayment,
            xeroData,
            null
          );

          return new Response(
            JSON.stringify({ success: true, paymentId }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (apiError) {
          console.error('Error syncing bill payment to Xero:', apiError);
          
          await logSyncOperation(
            supabaseUser,
            user.id,
            'bill_payment',
            billId,
            'create',
            'error',
            null,
            xeroPayment,
            null,
            apiError.message
          );

          return new Response(
            JSON.stringify({ success: false, error: `Failed to sync payment to Xero: ${apiError.message}` }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

      } catch (error) {
        console.error("Error in sync-bill-payment:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ===== SYNC INVOICE PAYMENT ENDPOINT =====
    if (path === "sync-invoice-payment") {
      try {
        const { invoiceId, paymentAmount, paymentDate, paymentAccountCode } = await req.json();

        if (!invoiceId || !paymentAmount) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invoice ID and payment amount are required' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const authHeader = req.headers.get('Authorization');
        if (!authHeader) {
          return new Response(
            JSON.stringify({ success: false, error: 'Missing authorization header' }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid or expired token' }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: invoice, error: invoiceError } = await supabaseUser
          .from('user_invoices')
          .select('*')
          .eq('id', invoiceId)
          .eq('user_id', user.id)
          .single();

        if (invoiceError || !invoice) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invoice not found' }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!invoice.xero_invoice_id) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Invoice must be synced to Xero before recording payments' 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const provider = 'xero';

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', provider)
          .single();

        if (integrationError || !integration || integration.status !== 'active') {
          return new Response(
            JSON.stringify({ success: false, error: 'Xero integration not found or inactive' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const mapping = await fetchAccountMapping(supabaseUser, user.id);
        if (!mapping || !mapping.is_configured) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Xero account mapping not configured. Please configure account mappings in settings.' 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const accountCode = paymentAccountCode || mapping.bank_payment_account_code;
        if (!accountCode) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Payment account code not specified and no default configured in mapping' 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const xeroPayment = {
          Invoice: {
            InvoiceID: invoice.xero_invoice_id
          },
          Account: {
            Code: accountCode
          },
          Date: paymentDate || new Date().toISOString().split('T')[0],
          Amount: paymentAmount
        };

        const xeroUrl = 'https://api.xero.com/api.xro/2.0/Payments';
        const xeroData = await callXeroAPI(
          supabaseUser,
          user.id,
          provider,
          integration,
          xeroUrl,
          'POST',
          { Payments: [xeroPayment] }
        );

        if (!xeroData || !xeroData.Payments || xeroData.Payments.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create payment in Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const externalPaymentId = xeroData.Payments[0].PaymentID;

        const { error: updateError } = await supabaseUser
          .from('user_invoices')
          .update({
            status: 'paid',
            last_synced_at: new Date().toISOString()
          })
          .eq('id', invoice.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Failed to update invoice status:', updateError);
        }

        await logSyncOperation(
          supabaseUser,
          user.id,
          'payment',
          invoice.id,
          'create',
          'success',
          externalPaymentId,
          { payment: xeroPayment },
          xeroData,
          null
        );

        return new Response(
          JSON.stringify({ success: true, externalId: externalPaymentId }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        console.error('Error in sync-invoice-payment:', error);
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync invoice to Xero
    if (path === "sync-invoice") {
      try {
        const { invoice, provider } = await req.json();
  
        if (provider !== 'xero') {
          throw new Error(`Provider ${provider} not supported`);
        }
  
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
  
        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const { data: integration, error: integrationError } = await supabaseUser
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
  
        const mapping = await fetchAccountMapping(supabaseUser, user.id);
        if (!mapping || !mapping.is_configured) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Xero account mapping not configured. Please configure account mappings in settings.' 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const xeroInvoice = {
          Type: 'ACCREC',
          Contact: {
            Name: invoice.customerName
          },
          Date: invoice.date,
          DueDate: invoice.dueDate,
          LineItems: invoice.items.map(item => ({
            Description: item.description,
            Quantity: item.quantity,
            UnitAmount: item.unitPrice,
            AccountCode: mapping.invoice_account_code,
            TaxType: item.taxRate && item.taxRate > 0 
              ? mapping.invoice_tax_code 
              : mapping.invoice_tax_free_code
          })),
          Reference: invoice.invoiceNumber,
          Status: 'AUTHORISED'
        };
  
        const isUpdate = Boolean(invoice.xeroInvoiceId);
        const xeroUrl = isUpdate 
          ? `https://api.xero.com/api.xro/2.0/Invoices/${invoice.xeroInvoiceId}`
          : 'https://api.xero.com/api.xro/2.0/Invoices';
        
        const xeroData = await callXeroAPI(
          supabaseUser,
          user.id,
          provider,
          integration,
          xeroUrl,
          'POST',
          { Invoices: [xeroInvoice] }
        );

        if (!xeroData || !xeroData.Invoices || xeroData.Invoices.length === 0) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to sync invoice to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
  
        const externalId = xeroData.Invoices[0].InvoiceID;
  
        const { error: updateError } = await supabaseUser
          .from('user_invoices')
          .update({
            xero_invoice_id: externalId,
            last_synced_at: new Date().toISOString()
          })
          .eq('id', invoice.id)
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Failed to update invoice with Xero ID:', updateError);
        }

        await logSyncOperation(
          supabaseUser,
          user.id,
          'invoice',
          invoice.id,
          isUpdate ? 'update' : 'create',
          'success',
          externalId,
          { invoice: xeroInvoice },
          xeroData,
          null
        );

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
    
    // Sync customers to Xero contacts
    if (path === "sync-customers") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { customerIds } = await req.json();

        if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
          return new Response(
            JSON.stringify({ error: "customerIds array is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .single();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: customers, error: customersError } = await supabaseUser
          .from('user_customers')
          .select('id, name, email, phone, status, xero_contact_id')
          .eq('user_id', user.id)
          .in('id', customerIds);

        if (customersError) {
          console.error('Error fetching customers:', customersError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch customers' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = [];

        for (const customer of customers) {
          try {
            const contactPayload = {
              Name: customer.name,
              EmailAddress: customer.email || undefined,
              IsCustomer: true,
              Phones: customer.phone ? [{
                PhoneType: "DEFAULT",
                PhoneNumber: customer.phone
              }] : [],
              ContactStatus: customer.status === 'active' ? 'ACTIVE' : 'ARCHIVED'
            };

            let url = 'https://api.xero.com/api.xro/2.0/Contacts';
            
            if (customer.xero_contact_id) {
              url = `https://api.xero.com/api.xro/2.0/Contacts/${customer.xero_contact_id}`;
            }

            const xeroResponse = await callXeroAPI(
              supabaseUser,
              user.id,
              'xero',
              integration,
              url,
              'POST',
              contactPayload
            );

            const xeroContactId = xeroResponse.Contacts[0].ContactID;

            await supabaseUser
              .from('user_customers')
              .update({
                xero_contact_id: xeroContactId,
                xero_synced_at: new Date().toISOString()
              })
              .eq('id', customer.id);

            await logSyncOperation(
              supabaseUser,
              user.id,
              'customer',
              customer.id,
              'create',
              'success',
              xeroContactId,
              contactPayload,
              xeroResponse,
              null
            );

            results.push({
              customerId: customer.id,
              success: true,
              xeroContactId: xeroContactId
            });

          } catch (error) {
            console.error(`Error syncing customer ${customer.id}:`, error);
            
            await logSyncOperation(
              supabaseUser,
              user.id,
              'customer',
              customer.id,
              'create',
              'error',
              null,
              null,
              null,
              error.message
            );

            results.push({
              customerId: customer.id,
              success: false,
              error: error.message
            });
          }
        }

        return new Response(
          JSON.stringify({ results }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error('Error in sync-customers:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync suppliers to Xero contacts
    if (path === "sync-suppliers") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { supplierIds } = await req.json();

        if (!supplierIds || !Array.isArray(supplierIds) || supplierIds.length === 0) {
          return new Response(
            JSON.stringify({ error: "supplierIds array is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .single();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: suppliers, error: suppliersError } = await supabaseUser
          .from('user_inventory_suppliers')
          .select('id, name, email, phone, address, contactperson, status, xero_contact_id')
          .eq('user_id', user.id)
          .in('id', supplierIds);

        if (suppliersError) {
          console.error('Error fetching suppliers:', suppliersError);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch suppliers' }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const results = [];

        for (const supplier of suppliers) {
          try {
            const contactPayload = {
              Name: supplier.name,
              EmailAddress: supplier.email || undefined,
              IsSupplier: true,
              ContactPersons: supplier.contactperson ? [{
                FirstName: supplier.contactperson,
                EmailAddress: supplier.email || undefined
              }] : [],
              Phones: supplier.phone ? [{
                PhoneType: "DEFAULT",
                PhoneNumber: supplier.phone
              }] : [],
              Addresses: supplier.address ? [{
                AddressType: "STREET",
                AddressLine1: supplier.address
              }] : [],
              ContactStatus: supplier.status === 'active' ? 'ACTIVE' : 'ARCHIVED'
            };

            let url = 'https://api.xero.com/api.xro/2.0/Contacts';
            
            if (supplier.xero_contact_id) {
              url = `https://api.xero.com/api.xro/2.0/Contacts/${supplier.xero_contact_id}`;
            }

            const xeroResponse = await callXeroAPI(
              supabaseUser,
              user.id,
              'xero',
              integration,
              url,
              'POST',
              contactPayload
            );

            const xeroContactId = xeroResponse.Contacts[0].ContactID;

            await supabaseUser
              .from('user_inventory_suppliers')
              .update({
                xero_contact_id: xeroContactId,
                xero_synced_at: new Date().toISOString()
              })
              .eq('id', supplier.id);

            await logSyncOperation(
              supabaseUser,
              user.id,
              'supplier',
              supplier.id,
              'create',
              'success',
              xeroContactId,
              contactPayload,
              xeroResponse,
              null
            );

            results.push({
              supplierId: supplier.id,
              success: true,
              xeroContactId: xeroContactId
            });

          } catch (error) {
            console.error(`Error syncing supplier ${supplier.id}:`, error);
            
            await logSyncOperation(
              supabaseUser,
              user.id,
              'supplier',
              supplier.id,
              'create',
              'error',
              null,
              null,
              null,
              error.message
            );

            results.push({
              supplierId: supplier.id,
              success: false,
              error: error.message
            });
          }
        }

        return new Response(
          JSON.stringify({ results }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error('Error in sync-suppliers:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Sync inventory item to Xero
    if (path === "sync-inventory-item") {
      try {
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
          return new Response(
            JSON.stringify({ error: "No authorization header" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create authenticated Supabase client for user-scoped operations
        const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: { headers: { Authorization: authHeader } }
        });

        const { data: { user }, error: userError } = await supabaseUser.auth.getUser();

        if (userError || !user) {
          return new Response(
            JSON.stringify({ error: "Invalid user token" }),
            { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { itemId } = await req.json();

        if (!itemId) {
          return new Response(
            JSON.stringify({ error: "itemId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: integration, error: integrationError } = await supabaseUser
          .from('accounting_integrations')
          .select('*')
          .eq('user_id', user.id)
          .eq('provider', 'xero')
          .single();

        if (integrationError || !integration) {
          return new Response(
            JSON.stringify({ error: 'Not connected to Xero' }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const mapping = await fetchAccountMapping(supabaseUser, user.id);
        
        if (!mapping || !mapping.inventory_asset_account_code || 
            !mapping.inventory_cogs_account_code || !mapping.inventory_sales_account_code) {
          return new Response(
            JSON.stringify({ 
              error: 'Inventory account mapping not configured. Please configure asset, COGS, and sales account codes in settings.' 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { data: item, error: itemError } = await supabaseUser
          .from('user_inventory_items')
          .select('id, code, name, description, price, retailprice, instock, category, brand, xero_item_id')
          .eq('user_id', user.id)
          .eq('id', itemId)
          .single();

        if (itemError || !item) {
          console.error('Error fetching item:', itemError);
          return new Response(
            JSON.stringify({ error: 'Item not found' }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const itemPayload = {
          Code: item.code || item.id.substring(0, 30),
          Name: item.name,
          Description: item.description || '',
          IsTrackedAsInventory: true,
          InventoryAssetAccountCode: mapping.inventory_asset_account_code,
          PurchaseDetails: {
            UnitPrice: item.price || 0,
            AccountCode: mapping.inventory_cogs_account_code,
            TaxType: mapping.bill_tax_code || 'NONE'
          },
          SalesDetails: {
            UnitPrice: item.retailprice || item.price || 0,
            AccountCode: mapping.inventory_sales_account_code,
            TaxType: mapping.invoice_tax_code || 'NONE'
          }
        };

        let url = 'https://api.xero.com/api.xro/2.0/Items';
        
        if (item.xero_item_id) {
          url = `https://api.xero.com/api.xro/2.0/Items/${item.xero_item_id}`;
        }

        const xeroResponse = await callXeroAPI(
          supabaseUser,
          user.id,
          'xero',
          integration,
          url,
          'POST',
          itemPayload
        );

        const xeroItemId = xeroResponse.Items[0].ItemID;

        await supabaseUser
          .from('user_inventory_items')
          .update({
            xero_item_id: xeroItemId,
            xero_synced_at: new Date().toISOString()
          })
          .eq('id', item.id);

        await logSyncOperation(
          supabaseUser,
          user.id,
          'inventory',
          item.id,
          'create',
          'success',
          xeroItemId,
          itemPayload,
          xeroResponse,
          null
        );

        return new Response(
          JSON.stringify({ 
            success: true,
            xeroItemId: xeroItemId
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

      } catch (error) {
        console.error('Error in sync-inventory-item:', error);
        
        const { itemId } = await req.json().catch(() => ({}));
        if (itemId) {
          const authHeader = req.headers.get("Authorization");
          if (authHeader) {
            const supabaseUser = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
              global: { headers: { Authorization: authHeader } }
            });
            const { data: { user } } = await supabaseUser.auth.getUser();
            if (user) {
              await logSyncOperation(
                supabaseUser,
                user.id,
                'inventory',
                itemId,
                'create',
                'error',
                null,
                null,
                null,
                error.message
              );
            }
          }
        }

        return new Response(
          JSON.stringify({ error: error.message }),
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
