
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  handleCors, 
  createJsonResponse, 
  createErrorResponse 
} from "../_shared/response-utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  // Create Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";

    // Create test table if it doesn't exist
    if (action === "setup") {
      try {
        // Attempt to create ezyparts_logs table
        await supabase.rpc('create_ezyparts_diagnostic_tables');
        
        return createJsonResponse({
          success: true,
          message: "Diagnostic tables set up successfully",
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }

    // Test endpoint accessibility
    if (action === "test") {
      // Add an entry to the logs table to confirm it's working
      const { data, error } = await supabase
        .from("ezyparts_logs")
        .insert({
          level: "info",
          message: "Diagnostic endpoint test",
          data: { source: "diagnostic-function", timestamp: new Date().toISOString() },
          created_at: new Date().toISOString()
        });

      if (error) {
        throw error;
      }

      return createJsonResponse({
        success: true,
        message: "Endpoint is accessible and working",
        data,
        timestamp: new Date().toISOString()
      });
    }

    // Check webhook functionality
    if (action === "test-webhook") {
      // Send a test payload to the ezyparts-quote endpoint
      const webhookUrl = `${url.origin}/api/ezyparts-quote`;
      
      const testQuotePayload = `
        <!DOCTYPE html>
        <html>
          <head><title>Test Quote Payload</title></head>
          <body>
            <div id="quotePayload">
              {
                "headers": {
                  "customerAccount": "TEST123",
                  "customerName": "Test Workshop",
                  "make": "TEST",
                  "model": "DIAGNOSTIC",
                  "rego": "TEST123",
                  "dateServed": "${new Date().toISOString()}"
                },
                "parts": [
                  {
                    "sku": "TST001",
                    "partDescription": "Test Part",
                    "partNumber": "TEST-001",
                    "brand": "Test Brand",
                    "retailPriceEa": 10.0,
                    "nettPriceEach": 8.5,
                    "qty": 1,
                    "partGroup": "TEST",
                    "productCategory": "Diagnostic",
                    "barcode": "1234567890"
                  }
                ]
              }
            </div>
          </body>
        </html>
      `;
      
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "text/html",
          },
          body: testQuotePayload
        });
        
        const responseText = await webhookResponse.text();
        
        return createJsonResponse({
          success: webhookResponse.ok,
          message: webhookResponse.ok ? "Webhook test successful" : "Webhook test failed",
          statusCode: webhookResponse.status,
          statusText: webhookResponse.statusText,
          responsePreview: responseText.substring(0, 500) + (responseText.length > 500 ? "..." : ""),
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        return createErrorResponse(error);
      }
    }

    // Get recent logs
    if (action === "logs") {
      const { data, error } = await supabase
        .from("ezyparts_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      return createJsonResponse({
        success: true,
        logs: data,
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      });
    }

    // Get recent payloads
    if (action === "payloads") {
      const { data, error } = await supabase
        .from("ezyparts_raw_payloads")
        .select("*")
        .order("received_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      return createJsonResponse({
        success: true,
        payloads: data?.map(p => ({
          ...p,
          raw_content: p.raw_content?.substring(0, 500) + (p.raw_content?.length > 500 ? "..." : "")
        })),
        count: data?.length || 0,
        timestamp: new Date().toISOString()
      });
    }

    // Show environment variables (non-sensitive)
    if (action === "env") {
      return createJsonResponse({
        supabaseUrl: supabaseUrl ? "Set" : "Not set",
        supabaseKey: supabaseKey ? "Set (redacted)" : "Not set",
        hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
        hasAnonymousKey: !!Deno.env.get("SUPABASE_ANON_KEY"),
        region: Deno.env.get("SUPABASE_FUNCTIONS_REGION") || "Unknown",
        timestamp: new Date().toISOString()
      });
    }

    // Default response with available actions
    return createJsonResponse({
      message: "EzyParts Diagnostic API",
      availableActions: [
        { action: "setup", description: "Set up diagnostic tables" },
        { action: "test", description: "Test endpoint accessibility" },
        { action: "test-webhook", description: "Test ezyparts-quote webhook endpoint" },
        { action: "logs", description: "View recent logs" },
        { action: "payloads", description: "View recent raw payloads" },
        { action: "env", description: "Show environment variables (non-sensitive)" }
      ],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return createErrorResponse(error);
  }
});
