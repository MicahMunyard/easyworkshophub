
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

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user ID from URL parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

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

    console.log("Processing webhook for user:", userId);

    // Log the raw request for debugging
    await supabase
      .from("ezyparts_logs")
      .insert({
        level: "info",
        message: "Webhook request received",
        data: {
          method: req.method,
          url: req.url,
          userId: userId,
          timestamp: new Date().toISOString()
        }
      });

    // Handle different content types
    const contentType = req.headers.get("content-type") || "";
    let payload = null;

    if (contentType.includes("application/json")) {
      const jsonData = await req.json();
      console.log("JSON data received:", jsonData);
      payload = jsonData;
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await req.formData();
      console.log("Form data received:", Object.fromEntries(formData.entries()));
      
      const quoteData = formData.get("quoteData") || formData.get("payload");
      if (quoteData) {
        try {
          payload = JSON.parse(quoteData.toString());
        } catch (e) {
          console.error("Error parsing form data as JSON:", e);
        }
      }
    } else {
      // Handle HTML content with embedded JSON
      const htmlContent = await req.text();
      console.log("HTML content received, length:", htmlContent.length);
      
      // Extract quote payload using multiple strategies
      const payloadMatch = htmlContent.match(/id=["']quotePayload["'][^>]*>(.*?)<\/div>/s);
      if (payloadMatch && payloadMatch[1]) {
        try {
          const rawPayload = payloadMatch[1].trim();
          console.log("Found quotePayload div, content:", rawPayload.substring(0, 200));
          
          // Try various parsing methods
          try {
            payload = JSON.parse(rawPayload);
          } catch {
            try {
              const decodedPayload = decodeURIComponent(rawPayload);
              payload = JSON.parse(decodedPayload);
            } catch {
              const htmlDecoded = rawPayload
                .replace(/&quot;/g, '"')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#39;/g, "'");
              payload = JSON.parse(htmlDecoded);
            }
          }
        } catch (parseError) {
          console.error("Error parsing quotePayload div content:", parseError);
        }
      }
    }

    console.log("Extracted payload:", !!payload);

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
      const inventoryResult = await processPartsToInventory(supabase, payload, userId);
      
      if (inventoryResult.success) {
        // Log successful processing
        await supabase
          .from("ezyparts_logs")
          .insert({
            level: "info",
            message: "Quote processed successfully",
            data: {
              quoteId: quoteData[0].id,
              userId: userId,
              vehicle: `${payload.headers?.make} ${payload.headers?.model}`,
              partsCount: payload.parts?.length,
              partsAddedToInventory: inventoryResult.addedCount,
              timestamp: new Date().toISOString()
            }
          });

        return createInventoryRedirectResponse(quoteData[0].id);
      } else {
        throw new Error(inventoryResult.error || "Failed to add parts to inventory");
      }
      
    } else {
      console.error("No valid quote payload found in request");
      
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "error",
          message: "No quote payload found",
          data: {
            userId: userId,
            contentType,
            timestamp: new Date().toISOString()
          }
        });

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

async function processPartsToInventory(supabase: any, payload: any, userId: string) {
  try {
    console.log("Processing parts to inventory for user:", userId);
    
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
        supplier_id: 'ezyparts-burson',
        in_stock: part.qty || 1,
        min_stock: 5,
        price: parseFloat(part.nettPriceEach) || 0,
        location: 'Main Warehouse',
        status: 'normal'
      };
    });

    console.log("Prepared inventory items:", inventoryItems.length);

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
    
    return {
      success: true,
      addedCount: inventoryItems.length,
      items: data
    };

  } catch (error) {
    console.error("Error processing parts to inventory:", error);
    
    return {
      success: false,
      error: error.message,
      addedCount: 0
    };
  }
}

function createInventoryRedirectResponse(quoteId: string): Response {
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
        <meta http-equiv="refresh" content="5; url=https://app.workshopbase.com.au/ezyparts">
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
          <p>You will be redirected to EzyParts dashboard in 5 seconds.</p>
          <p><a href="https://app.workshopbase.com.au/ezyparts">Click here to return to EzyParts dashboard</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "https://app.workshopbase.com.au/ezyparts";
          }, 5000);
        </script>
      </body>
    </html>
  `;
}
