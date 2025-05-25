
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== EzyParts Diagnostic Called ===");
  
  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";

    // Test EzyParts API connection
    if (action === "test-api") {
      try {
        // Get credentials from Supabase secrets
        const { data: clientId } = await supabase.functions.invoke('get-secret', { 
          body: { name: 'BURSONS_OAUTH_NAME' } 
        });
        
        const { data: clientSecret } = await supabase.functions.invoke('get-secret', { 
          body: { name: 'BURSONS_OAUTH_SECRET' } 
        });

        if (!clientId || !clientSecret) {
          return new Response(JSON.stringify({
            success: false,
            error: "Missing EzyParts credentials. Please configure BURSONS_OAUTH_NAME and BURSONS_OAUTH_SECRET in Supabase secrets.",
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        // Test OAuth token endpoint
        const authUrl = 'https://api.ezypartsqa.burson.com.au/authorizationserver/oauth/token';
        
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        
        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params.toString()
        });

        const responseText = await response.text();
        
        if (response.ok) {
          try {
            const tokenData = JSON.parse(responseText);
            return new Response(JSON.stringify({
              success: true,
              message: "Successfully connected to EzyParts API",
              data: {
                status: response.status,
                hasAccessToken: !!tokenData.access_token,
                tokenType: tokenData.token_type,
                expiresIn: tokenData.expires_in
              },
              timestamp: new Date().toISOString()
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          } catch (parseError) {
            return new Response(JSON.stringify({
              success: false,
              error: "Received non-JSON response from EzyParts API",
              data: {
                status: response.status,
                responsePreview: responseText.substring(0, 500)
              },
              timestamp: new Date().toISOString()
            }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }
            });
          }
        } else {
          return new Response(JSON.stringify({
            success: false,
            error: `EzyParts API returned error: ${response.status} ${response.statusText}`,
            data: {
              status: response.status,
              responseText: responseText.substring(0, 500)
            },
            timestamp: new Date().toISOString()
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: `Network error connecting to EzyParts: ${error.message}`,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Test webhook functionality
    if (action === "test-webhook") {
      try {
        const webhookUrl = `${url.origin}/functions/v1/ezyparts-quote`;
        console.log("Testing webhook at:", webhookUrl);
        
        const testPayload = {
          headers: {
            customerAccount: "TEST123",
            customerName: "Test Workshop",
            make: "TEST",
            model: "DIAGNOSTIC",
            rego: "TEST123",
            dateServed: new Date().toISOString()
          },
          parts: [
            {
              sku: "TST001",
              partDescription: "Test Part",
              partNumber: "TEST-001",
              brand: "Test Brand",
              retailPriceEa: 10.0,
              nettPriceEach: 8.5,
              qty: 1,
              partGroup: "TEST",
              productCategory: "Diagnostic",
              barcode: "1234567890"
            }
          ]
        };
        
        const webhookResponse = await fetch(`${webhookUrl}?user_id=test-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testPayload)
        });
        
        const responseText = await webhookResponse.text();
        
        return new Response(JSON.stringify({
          success: webhookResponse.ok,
          message: webhookResponse.ok ? "Webhook test successful" : "Webhook test failed",
          data: {
            status: webhookResponse.status,
            statusText: webhookResponse.statusText,
            responsePreview: responseText.substring(0, 500)
          },
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: `Webhook test failed: ${error.message}`,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Get recent logs
    if (action === "logs") {
      try {
        const { data, error } = await supabase
          .from("ezyparts_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20);
        
        if (error) throw error;
        
        return new Response(JSON.stringify({
          success: true,
          logs: data || [],
          count: data?.length || 0,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch logs: ${error.message}`,
          timestamp: new Date().toISOString()
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Show environment variables (non-sensitive)
    if (action === "env") {
      return new Response(JSON.stringify({
        supabaseUrl: supabaseUrl ? "Set" : "Not set",
        supabaseKey: supabaseKey ? "Set (redacted)" : "Not set",
        hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        hasAnonymousKey: !!Deno.env.get("SUPABASE_ANON_KEY"),
        region: Deno.env.get("SUPABASE_FUNCTIONS_REGION") || "Unknown",
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Default response with available actions
    return new Response(JSON.stringify({
      message: "EzyParts Diagnostic API",
      availableActions: [
        { action: "test-api", description: "Test EzyParts API connection and authentication" },
        { action: "test-webhook", description: "Test ezyparts-quote webhook endpoint" },
        { action: "logs", description: "View recent logs" },
        { action: "env", description: "Show environment variables (non-sensitive)" }
      ],
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Diagnostic error:", error);
    return new Response(JSON.stringify({
      success: false,
      error: `Diagnostic error: ${error.message}`,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
