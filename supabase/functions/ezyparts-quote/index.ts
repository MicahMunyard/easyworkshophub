
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
    // Initialize Supabase client with service role for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user ID from URL parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('user_id');

    console.log("Processing webhook for user:", userId);

    if (!userId) {
      console.error("No user ID provided in request");
      return new Response(
        createErrorPage("User authentication required. Please ensure you're logged in to WorkshopBase."),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/html"
          } 
        }
      );
    }

    // Log the incoming request for debugging
    await supabase
      .from("ezyparts_logs")
      .insert({
        level: "info",
        message: "Webhook request received",
        data: {
          method: req.method,
          url: req.url,
          userId: userId,
          timestamp: new Date().toISOString(),
          headers: Object.fromEntries(req.headers.entries())
        }
      });

    // Handle different content types and methods
    const contentType = req.headers.get("content-type") || "";
    let payload = null;

    // Handle GET requests (for testing)
    if (req.method === "GET") {
      console.log("GET request received - returning test response");
      return new Response(
        createTestPage(userId),
        { 
          status: 200,
          headers: { 
            ...corsHeaders,
            "Content-Type": "text/html"
          } 
        }
      );
    }

    // Handle POST requests with data
    if (req.method === "POST") {
      console.log("POST request received, content-type:", contentType);
      
      if (contentType.includes("application/json")) {
        const jsonData = await req.json();
        console.log("JSON data received:", jsonData);
        payload = jsonData;
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        const formData = await req.formData();
        console.log("Form data received:", Object.fromEntries(formData.entries()));
        
        // Look for common field names that might contain the quote data
        const possibleFields = ['quoteData', 'payload', 'data', 'quote', 'parts'];
        for (const field of possibleFields) {
          const fieldData = formData.get(field);
          if (fieldData) {
            try {
              payload = JSON.parse(fieldData.toString());
              console.log("Successfully parsed payload from field:", field);
              break;
            } catch (e) {
              console.log("Failed to parse field", field, "as JSON:", e);
            }
          }
        }
      } else {
        // Handle HTML content or plain text
        const textContent = await req.text();
        console.log("Text content received, length:", textContent.length);
        console.log("First 500 chars:", textContent.substring(0, 500));
        
        // Try to extract JSON from various HTML patterns
        const patterns = [
          /id=["']quotePayload["'][^>]*>(.*?)<\/div>/s,
          /quoteData\s*=\s*['"](.+?)['"]/ ,
          /data-quote=['"](.+?)['"]/ ,
          /"quoteData":\s*"(.+?)"/,
          /quotePayload['"]\s*:\s*['"](.+?)['"]/
        ];
        
        for (const pattern of patterns) {
          const match = textContent.match(pattern);
          if (match && match[1]) {
            try {
              console.log("Found potential payload with pattern:", pattern.source);
              let rawPayload = match[1].trim();
              
              // Try different decoding methods
              const decodingMethods = [
                (str: string) => JSON.parse(str),
                (str: string) => JSON.parse(decodeURIComponent(str)),
                (str: string) => JSON.parse(str.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'")),
              ];
              
              for (const method of decodingMethods) {
                try {
                  payload = method(rawPayload);
                  console.log("Successfully decoded payload with method");
                  break;
                } catch (e) {
                  // Try next method
                }
              }
              
              if (payload) break;
            } catch (e) {
              console.log("Failed to parse with pattern:", pattern.source, e);
            }
          }
        }
      }
    }

    console.log("Final payload status:", !!payload);
    console.log("Payload preview:", payload ? JSON.stringify(payload).substring(0, 200) : "null");

    if (payload && payload.headers && payload.parts) {
      console.log("Valid EzyParts payload found:", {
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

      // Process parts and add to inventory with vehicle fitment
      const inventoryResult = await processPartsToInventory(supabase, payload, userId);
      
      if (inventoryResult.success) {
        console.log("Successfully processed", inventoryResult.addedCount, "parts to inventory");
        
        // Log successful processing
        await supabase
          .from("ezyparts_logs")
          .insert({
            level: "info",
            message: "Quote processed and parts added to inventory",
            data: {
              quoteId: quoteData[0].id,
              userId: userId,
              vehicle: `${payload.headers?.make} ${payload.headers?.model}`,
              partsCount: payload.parts?.length,
              partsAddedToInventory: inventoryResult.addedCount,
              vehicleFitmentAdded: inventoryResult.vehicleFitmentCount,
              timestamp: new Date().toISOString()
            }
          });

        return createSuccessRedirectResponse(inventoryResult.addedCount, inventoryResult.vehicleFitmentCount);
      } else {
        throw new Error(inventoryResult.error || "Failed to add parts to inventory");
      }
      
    } else {
      console.error("No valid quote payload found in request");
      console.log("Request details for debugging:");
      console.log("- Content-Type:", contentType);
      console.log("- Method:", req.method);
      console.log("- Has payload:", !!payload);
      console.log("- Has headers:", payload?.headers ? "yes" : "no");
      console.log("- Has parts:", payload?.parts ? "yes" : "no");
      
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "error",
          message: "No valid quote payload found",
          data: {
            userId: userId,
            contentType,
            method: req.method,
            hasPayload: !!payload,
            timestamp: new Date().toISOString()
          }
        });

      return new Response(
        createErrorPage("No quote data received from EzyParts. Please ensure you clicked 'Send to WMS' after selecting parts."),
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

    // Extract vehicle information for fitment tags
    const vehicleInfo = {
      make: payload.headers?.make || '',
      model: payload.headers?.model || '',
      rego: payload.headers?.rego || ''
    };

    console.log("Vehicle info extracted:", vehicleInfo);

    // Convert EzyParts parts to user inventory items format
    const inventoryItems = payload.parts.map((part: any) => {
      const code = part.partNumber || part.sku || `EP-${Math.random().toString(36).substring(2, 8)}`;
      
      // Determine proper category based on part data
      let category = 'Auto Parts'; // Default category
      if (part.productCategory && part.productCategory !== 'WEB') {
        category = part.productCategory;
      } else if (part.partGroup) {
        // Try to derive category from part group
        const partGroup = part.partGroup.toLowerCase();
        if (partGroup.includes('oil') || partGroup.includes('lubric')) {
          category = 'Oil & Lubricants';
        } else if (partGroup.includes('filter')) {
          category = 'Filters';
        } else if (partGroup.includes('brake')) {
          category = 'Brake Parts';
        } else if (partGroup.includes('engine')) {
          category = 'Engine Parts';
        } else if (partGroup.includes('electric')) {
          category = 'Electrical';
        } else {
          category = 'General Parts';
        }
      }

      // Try to get actual product image from EzyParts if available
      let imageUrl = '';
      if (part.imageUrl) {
        imageUrl = part.imageUrl;
      } else if (part.sku) {
        // Generate potential image URLs based on common patterns
        imageUrl = generateProductImageUrl(part.sku, part.brand);
      }
      
      return {
        user_id: userId,
        code: code.toUpperCase(),
        name: part.partDescription || 'Unknown Part',
        description: `${part.partDescription || 'Unknown Part'} - Brand: ${part.brand || 'Unknown'} - SKU: ${part.sku || part.partNumber} - Vehicle: ${vehicleInfo.make} ${vehicleInfo.model}`,
        category: category,
        supplier: 'Burson Auto Parts',
        supplier_id: 'burson-auto-parts',
        in_stock: part.qty || 1,
        min_stock: 5,
        price: parseFloat(part.nettPriceEach) || 0,
        location: 'Main Warehouse',
        status: 'normal',
        image_url: imageUrl || null,
        brand: part.brand || 'Unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });

    console.log("Prepared inventory items for insertion:", inventoryItems.length);
    console.log("Sample inventory item:", inventoryItems[0]);

    // Insert into user inventory items with error handling
    const { data: inventoryData, error } = await supabase
      .from('user_inventory_items')
      .insert(inventoryItems)
      .select('id, name, brand, image_url, supplier');

    if (error) {
      console.error("Error adding parts to user inventory:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Successfully added ${inventoryItems.length} parts to user inventory`);
    console.log("Added items:", inventoryData?.map(item => ({ 
      name: item.name, 
      brand: item.brand, 
      supplier: item.supplier,
      hasImage: !!item.image_url 
    })) || []);

    // Now add vehicle fitment tags if we have vehicle information
    let vehicleFitmentCount = 0;
    if (vehicleInfo.make && vehicleInfo.model && inventoryData && inventoryData.length > 0) {
      vehicleFitmentCount = await addVehicleFitmentTags(supabase, inventoryData, vehicleInfo);
    }
    
    return {
      success: true,
      addedCount: inventoryItems.length,
      vehicleFitmentCount: vehicleFitmentCount,
      items: inventoryData
    };

  } catch (error) {
    console.error("Error processing parts to inventory:", error);
    
    return {
      success: false,
      error: error.message,
      addedCount: 0,
      vehicleFitmentCount: 0
    };
  }
}

async function addVehicleFitmentTags(supabase: any, inventoryItems: any[], vehicleInfo: any) {
  try {
    console.log("Adding vehicle fitment tags for:", vehicleInfo);

    // First, check if the vehicle fitment tag already exists
    const { data: existingTag, error: selectError } = await supabase
      .from('vehicle_fitment_tags')
      .select('id')
      .eq('make', vehicleInfo.make.toUpperCase())
      .eq('model', vehicleInfo.model.toUpperCase())
      .maybeSingle();

    if (selectError) {
      console.error("Error checking existing vehicle fitment tag:", selectError);
      return 0;
    }

    let vehicleTagId;

    if (existingTag) {
      vehicleTagId = existingTag.id;
      console.log("Using existing vehicle fitment tag:", vehicleTagId);
    } else {
      // Create new vehicle fitment tag
      const { data: newTag, error: insertError } = await supabase
        .from('vehicle_fitment_tags')
        .insert({
          make: vehicleInfo.make.toUpperCase(),
          model: vehicleInfo.model.toUpperCase()
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("Error creating vehicle fitment tag:", insertError);
        return 0;
      }

      vehicleTagId = newTag.id;
      console.log("Created new vehicle fitment tag:", vehicleTagId);
    }

    // Link all inventory items to this vehicle fitment tag
    const fitmentLinks = inventoryItems.map(item => ({
      inventory_item_id: item.id,
      vehicle_fitment_tag_id: vehicleTagId
    }));

    const { data: fitmentData, error: fitmentError } = await supabase
      .from('inventory_vehicle_fitment')
      .insert(fitmentLinks)
      .select('id');

    if (fitmentError) {
      console.error("Error creating vehicle fitment links:", fitmentError);
      return 0;
    }

    console.log(`Successfully linked ${fitmentData?.length || 0} parts to vehicle ${vehicleInfo.make} ${vehicleInfo.model}`);
    return fitmentData?.length || 0;

  } catch (error) {
    console.error("Error in addVehicleFitmentTags:", error);
    return 0;
  }
}

function generateProductImageUrl(sku: string, brand: string): string {
  // Try to generate a product image URL
  // This is a best-effort approach since we don't have direct access to Burson's image API
  
  if (!sku) return '';
  
  // Common patterns for automotive parts suppliers
  const possibleImageUrls = [
    `https://images.burson.com.au/products/${sku.toLowerCase()}.jpg`,
    `https://images.burson.com.au/products/${sku.toUpperCase()}.jpg`,
    `https://cdn.burson.com.au/images/products/${sku.toLowerCase()}.png`,
    `https://api.burson.com.au/images/${sku}.jpg`,
  ];
  
  // For now, return the first pattern
  // In a real implementation, you might want to test which URL actually exists
  return possibleImageUrls[0];
}

function createSuccessRedirectResponse(partsCount: number, vehicleFitmentCount: number = 0): Response {
  const baseUrl = 'https://app.workshopbase.com.au';
  const successUrl = `${baseUrl}/inventory?tab=inventory&ezyparts_products=added`;
  
  const vehicleText = vehicleFitmentCount > 0 ? ` with vehicle fitment data for ${vehicleFitmentCount} items` : '';
  
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
            max-width: 500px;
          }
          .success-icon {
            color: #10b981;
            font-size: 48px;
            margin-bottom: 16px;
          }
          .loading {
            display: inline-block;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success-icon">✅</div>
          <h2>Parts Successfully Added!</h2>
          <p><strong>${partsCount} part${partsCount !== 1 ? 's' : ''}</strong> from Burson Auto Parts have been added to your WorkshopBase inventory${vehicleText}.</p>
          <p>Product categories, brand information, and vehicle fitment tags have been included for easy filtering and identification.</p>
          <p><span class="loading">⟳</span> Redirecting to your inventory in 3 seconds...</p>
          <p><a href="${successUrl}" style="color: #2563eb; text-decoration: none;">Click here to view your inventory now →</a></p>
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

function createTestPage(userId: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EzyParts Webhook Test</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            padding: 2rem;
            background-color: #f8f9fa;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .status {
            padding: 1rem;
            border-radius: 4px;
            margin: 1rem 0;
            background-color: #d1ecf1;
            border-left: 4px solid #17a2b8;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>EzyParts Webhook Test</h1>
          <div class="status">
            <strong>Status:</strong> Webhook is accessible and working<br>
            <strong>User ID:</strong> ${userId}<br>
            <strong>Time:</strong> ${new Date().toISOString()}<br>
            <strong>Environment:</strong> ${Deno.env.get("EZYPARTS_ENVIRONMENT") || "staging"}
          </div>
          <p>This endpoint is ready to receive EzyParts quote data.</p>
          <p>When you click "Send to WMS" in EzyParts, the parts will be automatically added to your inventory with:</p>
          <ul>
            <li>Proper product categories (Filters, Oil & Lubricants, etc.)</li>
            <li>Product images from Burson Auto Parts (when available)</li>
            <li>Brand information and supplier details</li>
            <li>Vehicle fitment tags for easy filtering</li>
          </ul>
        </div>
      </body>
    </html>
  `;
}

function createErrorPage(message: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>EzyParts Integration Issue</title>
        <meta http-equiv="refresh" content="8; url=https://app.workshopbase.com.au/ezyparts">
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
            max-width: 500px;
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
          <p><strong>Next steps:</strong></p>
          <ol style="text-align: left;">
            <li>Return to WorkshopBase EzyParts dashboard</li>
            <li>Search for your vehicle again</li>
            <li>Select your parts in EzyParts</li>
            <li>Click "Send to WMS" to send them to your inventory</li>
          </ol>
          <p><em>You will be redirected to EzyParts dashboard in 8 seconds.</em></p>
          <p><a href="https://app.workshopbase.com.au/ezyparts" style="color: #2563eb; text-decoration: none;">Click here to return to EzyParts dashboard now →</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "https://app.workshopbase.com.au/ezyparts";
          }, 8000);
        </script>
      </body>
    </html>
  `;
}
