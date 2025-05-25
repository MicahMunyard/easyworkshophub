
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

  console.log("=== EzyParts Quote Webhook Called ===");
  console.log("Method:", req.method);
  console.log("URL:", req.url);
  console.log("Headers:", Object.fromEntries(req.headers.entries()));

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user ID from URL parameters, headers, or try to extract from auth
    const url = new URL(req.url);
    let userId = url.searchParams.get('user_id') || req.headers.get('x-user-id');

    // If no user ID provided, try to get from authorization header
    if (!userId) {
      const authHeader = req.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const token = authHeader.replace('Bearer ', '');
          const { data: { user }, error } = await supabase.auth.getUser(token);
          if (user && !error) {
            userId = user.id;
          }
        } catch (authError) {
          console.log("Could not authenticate user from token:", authError);
        }
      }
    }

    // If still no user ID, show error
    if (!userId) {
      console.error("No user ID provided in request");
      return new Response(
        createErrorPage("User authentication required. Please log in and try again."),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/html"
          } 
        }
      );
    }

    // Log the raw request for debugging
    try {
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "info",
          message: "Webhook request received",
          data: {
            method: req.method,
            url: req.url,
            userId: userId,
            headers: Object.fromEntries(req.headers.entries()),
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.warn("Could not log to database:", logError);
    }

    // Handle different content types
    const contentType = req.headers.get("content-type") || "";
    let htmlContent = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      console.log("Form data received:", Object.fromEntries(formData.entries()));
      
      const quoteData = formData.get("quoteData") || formData.get("payload");
      if (quoteData) {
        htmlContent = quoteData.toString();
      }
    } else if (contentType.includes("application/json")) {
      const jsonData = await req.json();
      console.log("JSON data received:", jsonData);
      
      if (jsonData.headers && jsonData.parts) {
        // Store quote first
        const { data: quoteData, error: quoteError } = await supabase
          .from("ezyparts_quotes")
          .insert({
            user_id: userId,
            quote_data: jsonData,
            created_at: new Date().toISOString()
          })
          .select("id");
        
        if (quoteError) {
          console.error("Error storing quote:", quoteError);
          throw quoteError;
        }
        
        // Process parts to inventory
        const inventoryResult = await processPartsToInventory(supabase, jsonData, quoteData[0].id, userId);
        
        if (inventoryResult.success) {
          return createInventoryRedirectResponse(req.url, quoteData[0].id);
        } else {
          throw new Error(inventoryResult.error || "Failed to add parts to inventory");
        }
      }
    } else {
      htmlContent = await req.text();
    }

    console.log("Raw content length:", htmlContent.length);
    console.log("Content preview:", htmlContent.substring(0, 500));

    // Store raw payload for debugging
    try {
      await supabase
        .from("ezyparts_raw_payloads")
        .insert({
          source: "webhook",
          content_type: contentType,
          raw_content: htmlContent,
          received_at: new Date().toISOString()
        });
    } catch (payloadError) {
      console.warn("Could not store raw payload:", payloadError);
    }

    // Extract quote payload using multiple strategies
    let payload = null;
    let extractionMethod = "";

    // Strategy 1: Look for quotePayload div
    const payloadMatch = htmlContent.match(/id=["']quotePayload["'][^>]*>(.*?)<\/div>/s);
    if (payloadMatch && payloadMatch[1]) {
      try {
        const rawPayload = payloadMatch[1].trim();
        console.log("Found quotePayload div, content:", rawPayload.substring(0, 200));
        
        // Try various parsing methods
        try {
          payload = JSON.parse(rawPayload);
          extractionMethod = "div-direct";
        } catch {
          try {
            const decodedPayload = decodeURIComponent(rawPayload);
            payload = JSON.parse(decodedPayload);
            extractionMethod = "div-decoded";
          } catch {
            const htmlDecoded = rawPayload
              .replace(/&quot;/g, '"')
              .replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&#39;/g, "'");
            payload = JSON.parse(htmlDecoded);
            extractionMethod = "div-html-decoded";
          }
        }
      } catch (parseError) {
        console.error("Error parsing quotePayload div content:", parseError);
      }
    }

    // Strategy 2: Look for JSON in entire content if it starts with {
    if (!payload && htmlContent.trim().startsWith('{')) {
      try {
        payload = JSON.parse(htmlContent);
        extractionMethod = "full-content";
      } catch (e) {
        console.log("Content is not valid JSON");
      }
    }

    console.log("Extraction method used:", extractionMethod);
    console.log("Payload extracted:", !!payload);

    if (payload && payload.headers && payload.parts) {
      console.log("Valid payload found:", {
        vehicle: `${payload.headers?.make || 'Unknown'} ${payload.headers?.model || 'Unknown'}`,
        parts: payload.parts?.length || 0,
        customer: payload.headers?.customerName || 'Unknown'
      });

      // Store the quote in the database
      const { data: quoteData, error: quoteError } = await supabase
        .from("ezyparts_quotes")
        .insert({
          user_id: userId,
          quote_data: payload,
          created_at: new Date().toISOString()
        })
        .select("id");
      
      if (quoteError) {
        console.error("Error storing quote:", quoteError);
        throw quoteError;
      }
      
      console.log("Quote stored successfully with ID:", quoteData[0].id);

      // Process parts and add to inventory
      const inventoryResult = await processPartsToInventory(supabase, payload, quoteData[0].id, userId);
      
      if (inventoryResult.success) {
        // Log successful processing
        try {
          await supabase
            .from("ezyparts_logs")
            .insert({
              level: "info",
              message: "Quote processed successfully",
              data: {
                quoteId: quoteData[0].id,
                userId: userId,
                extractionMethod,
                vehicle: `${payload.headers?.make} ${payload.headers?.model}`,
                partsCount: payload.parts?.length,
                partsAddedToInventory: inventoryResult.addedCount,
                timestamp: new Date().toISOString()
              }
            });
        } catch (logError) {
          console.warn("Could not log success:", logError);
        }

        return createInventoryRedirectResponse(req.url, quoteData[0].id);
      } else {
        throw new Error(inventoryResult.error || "Failed to add parts to inventory");
      }
      
    } else {
      console.error("No valid quote payload found in request");
      
      try {
        await supabase
          .from("ezyparts_logs")
          .insert({
            level: "error",
            message: "No quote payload found",
            data: {
              userId: userId,
              contentType,
              contentLength: htmlContent.length,
              contentPreview: htmlContent.substring(0, 1000),
              timestamp: new Date().toISOString()
            }
          });
      } catch (logError) {
        console.warn("Could not log error:", logError);
      }

      return new Response(
        createErrorPage("No quote data found in the request. Please make sure you clicked 'Send to WMS' in EzyParts."),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/html"
          } 
        }
      );
    }
  } catch (error) {
    console.error("Error processing EzyParts webhook:", error);
    
    // Log error to database if possible
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "error",
          message: "Webhook processing error",
          data: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(
      createErrorPage(`Processing error: ${error.message}. Please try again or contact support.`),
      { 
        status: 200,
        headers: { 
          ...corsHeaders,
          "Content-Type": "text/html"
        } 
      }
    );
  }
});

async function processPartsToInventory(supabase: any, payload: any, quoteId: string, userId: string) {
  try {
    console.log("Processing parts to inventory for quote:", quoteId, "user:", userId);
    
    if (!payload.parts || !Array.isArray(payload.parts) || payload.parts.length === 0) {
      throw new Error("No parts found in payload");
    }

    // Convert EzyParts parts to user inventory items format
    const inventoryItems = payload.parts.map((part: any) => {
      const code = `EP-${part.sku.toUpperCase()}-${Math.random().toString(36).substring(2, 8)}`;
      
      return {
        user_id: userId,
        code,
        name: part.partDescription || 'Unknown Part',
        description: `${part.partDescription || 'Unknown Part'} - Brand: ${part.brand || 'Unknown'}`,
        category: part.productCategory || 'Auto Parts',
        supplier: 'Burson Auto Parts',
        in_stock: part.qty || 1,
        min_stock: 5,
        price: parseFloat(part.nettPriceEach) || 0,
        location: 'Main Warehouse',
        status: 'normal',
        last_order: new Date().toISOString()
      };
    });

    console.log("Prepared inventory items:", inventoryItems.length);
    console.log("Sample item:", inventoryItems[0]);

    // Add to user inventory items
    const { data, error } = await supabase
      .from('user_inventory_items')
      .insert(inventoryItems)
      .select('id');

    if (error) {
      console.error("Error adding parts to user inventory:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Successfully added ${inventoryItems.length} parts to user inventory`);
    console.log("Inserted items IDs:", data?.map((item: any) => item.id));
    
    return {
      success: true,
      addedCount: inventoryItems.length,
      items: data
    };

  } catch (error) {
    console.error("Error processing parts to inventory:", error);
    
    // Log the error but return detailed info
    try {
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "error",
          message: "Failed to add parts to inventory",
          data: {
            quoteId,
            userId,
            error: error.message,
            timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.warn("Could not log inventory error:", logError);
    }
    
    return {
      success: false,
      error: error.message,
      addedCount: 0
    };
  }
}

function createInventoryRedirectResponse(requestUrl: string, quoteId: string): Response {
  const baseUrl = 'https://app.workshopbase.com.au';
  const successUrl = `${baseUrl}/inventory?tab=inventory&ezyparts_products=added`;
  
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EzyParts Parts Added Successfully</title>
        <meta http-equiv="refresh" content="3; url=${successUrl}">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background-color: #f0f9ff;
          }
          .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #10b981;
          }
          .success-icon {
            color: #10b981;
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h2>Parts Successfully Added!</h2>
          <p>Your selected parts from EzyParts have been added to your inventory and are ready for job invoicing.</p>
          <p>You will be redirected to your inventory in 3 seconds.</p>
          <p><a href="${successUrl}">Click here to view your inventory now</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "${successUrl}";
          }, 3000);
        </script>
      </body>
    </html>
    `,
    { 
      headers: { 
        ...corsHeaders,
        "Content-Type": "text/html"
      } 
    }
  );
}

function createErrorPage(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EzyParts Integration Error</title>
        <meta http-equiv="refresh" content="5; url=https://app.workshopbase.com.au/ezyparts/search">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background-color: #fef2f2;
          }
          .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            border-left: 4px solid #ef4444;
          }
          .error-icon {
            color: #ef4444;
            font-size: 48px;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">⚠️</div>
          <h2>EzyParts Integration Issue</h2>
          <p>${message}</p>
          <p>You will be redirected to vehicle search in 5 seconds.</p>
          <p><a href="https://app.workshopbase.com.au/ezyparts/search">Click here to return to vehicle search</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "https://app.workshopbase.com.au/ezyparts/search";
          }, 5000);
        </script>
      </body>
    </html>
  `;
}
