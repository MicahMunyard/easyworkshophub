
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

    // Log the raw request for debugging
    await supabase
      .from("ezyparts_logs")
      .insert({
        level: "info",
        message: "Webhook request received",
        data: {
          method: req.method,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries()),
          timestamp: new Date().toISOString()
        }
      });

    // Handle different content types
    const contentType = req.headers.get("content-type") || "";
    let htmlContent = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      // Handle form data (EzyParts might send this way)
      const formData = await req.formData();
      console.log("Form data received:", Object.fromEntries(formData.entries()));
      
      // Check if quote data is in form field
      const quoteData = formData.get("quoteData") || formData.get("payload");
      if (quoteData) {
        htmlContent = quoteData.toString();
      }
    } else if (contentType.includes("application/json")) {
      // Handle JSON payload
      const jsonData = await req.json();
      console.log("JSON data received:", jsonData);
      
      // If it's already parsed JSON, store it directly
      if (jsonData.headers && jsonData.parts) {
        const { data, error } = await supabase
          .from("ezyparts_quotes")
          .insert({
            quote_data: jsonData,
            created_at: new Date().toISOString()
          })
          .select("id");
        
        if (error) throw error;
        
        return createRedirectResponse(req.url, data[0].id);
      }
    } else {
      // Handle HTML content (default expected format)
      htmlContent = await req.text();
    }

    console.log("Raw content length:", htmlContent.length);
    console.log("Content preview:", htmlContent.substring(0, 500));

    // Log the raw content for debugging
    await supabase
      .from("ezyparts_raw_payloads")
      .insert({
        source: "webhook",
        content_type: contentType,
        raw_content: htmlContent,
        received_at: new Date().toISOString()
      });

    // Multiple strategies to extract the quote payload
    let payload = null;
    let extractionMethod = "";

    // Strategy 1: Look for quotePayload div (standard method)
    const payloadMatch = htmlContent.match(/id=["']quotePayload["'][^>]*>(.*?)<\/div>/s);
    if (payloadMatch && payloadMatch[1]) {
      try {
        const rawPayload = payloadMatch[1].trim();
        console.log("Found quotePayload div, content:", rawPayload.substring(0, 200));
        
        // Try direct JSON parse first
        try {
          payload = JSON.parse(rawPayload);
          extractionMethod = "div-direct";
        } catch {
          // Try decoding if it's URL encoded
          try {
            const decodedPayload = decodeURIComponent(rawPayload);
            payload = JSON.parse(decodedPayload);
            extractionMethod = "div-decoded";
          } catch {
            // Try HTML entity decoding
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

    // Strategy 2: Look for JSON in script tags
    if (!payload) {
      const scriptMatch = htmlContent.match(/<script[^>]*>(.*?)<\/script>/gs);
      if (scriptMatch) {
        for (const script of scriptMatch) {
          const jsonMatch = script.match(/({.*"headers".*"parts".*})/s);
          if (jsonMatch) {
            try {
              payload = JSON.parse(jsonMatch[1]);
              extractionMethod = "script-tag";
              break;
            } catch (e) {
              console.log("Failed to parse JSON from script tag");
            }
          }
        }
      }
    }

    // Strategy 3: Look for any JSON-like structure in the content
    if (!payload) {
      const jsonPattern = /({[^{}]*"headers"[^{}]*"parts"[^{}]*})/s;
      const jsonMatch = htmlContent.match(jsonPattern);
      if (jsonMatch) {
        try {
          payload = JSON.parse(jsonMatch[1]);
          extractionMethod = "pattern-match";
        } catch (e) {
          console.log("Failed to parse JSON from pattern match");
        }
      }
    }

    // Strategy 4: Check if the entire content is JSON
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

    if (payload) {
      // Validate the payload has required fields
      if (!payload.headers || !payload.parts) {
        throw new Error("Invalid payload structure - missing headers or parts");
      }

      console.log("Valid payload found:", {
        vehicle: `${payload.headers?.make || 'Unknown'} ${payload.headers?.model || 'Unknown'}`,
        parts: payload.parts?.length || 0,
        customer: payload.headers?.customerName || 'Unknown'
      });

      // Store the quote in the database
      const { data, error } = await supabase
        .from("ezyparts_quotes")
        .insert({
          quote_data: payload,
          created_at: new Date().toISOString()
        })
        .select("id");
      
      if (error) {
        console.error("Error storing quote:", error);
        throw error;
      }
      
      console.log("Quote stored successfully with ID:", data[0].id);

      // Log successful processing
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "info",
          message: "Quote processed successfully",
          data: {
            quoteId: data[0].id,
            extractionMethod,
            vehicle: `${payload.headers?.make} ${payload.headers?.model}`,
            partsCount: payload.parts?.length,
            timestamp: new Date().toISOString()
          }
        });

      // Return redirect response
      return createRedirectResponse(req.url, data[0].id);
      
    } else {
      // No payload found - log for debugging
      console.error("No quote payload found in request");
      
      await supabase
        .from("ezyparts_logs")
        .insert({
          level: "error",
          message: "No quote payload found",
          data: {
            contentType,
            contentLength: htmlContent.length,
            contentPreview: htmlContent.substring(0, 1000),
            timestamp: new Date().toISOString()
          }
        });

      // Return error page that will redirect after showing message
      return new Response(
        createErrorPage("No quote data found in the request. Please try again or contact support."),
        { 
          status: 200, // Use 200 so browser doesn't show error page
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

    // Return user-friendly error page
    return new Response(
      createErrorPage(`Processing error: ${error.message}. Please try again.`),
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

function createRedirectResponse(requestUrl: string, quoteId: string): Response {
  const url = new URL(requestUrl);
  const baseUrl = `${url.protocol}//${url.host}`;
  const quoteHandlerUrl = `${baseUrl}/ezyparts/quote?quote_id=${quoteId}`;
  
  return new Response(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Processing EzyParts Quote</title>
        <meta http-equiv="refresh" content="2; url=${quoteHandlerUrl}">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            display: flex; 
            justify-content: center; 
            align-items: center; 
            height: 100vh; 
            margin: 0;
            background-color: #f5f5f5;
          }
          .container {
            text-align: center;
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .spinner {
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Processing Your EzyParts Quote</h2>
          <div class="spinner"></div>
          <p>Your quote has been received and is being processed...</p>
          <p>You will be redirected automatically in 2 seconds.</p>
          <p><a href="${quoteHandlerUrl}">Click here if you are not redirected automatically</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "${quoteHandlerUrl}";
          }, 2000);
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
        <meta http-equiv="refresh" content="5; url=/ezyparts/search">
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
          <p><a href="/ezyparts/search">Click here to return to vehicle search</a></p>
        </div>
        <script>
          setTimeout(function() {
            window.location.href = "/ezyparts/search";
          }, 5000);
        </script>
      </body>
    </html>
  `;
}
