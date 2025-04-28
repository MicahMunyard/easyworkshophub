
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("EzyParts quote payload received");

  try {
    // Parse the HTML content from the request
    const htmlContent = await req.text();
    console.log("Received content length:", htmlContent.length);
    
    // Extract the JSON payload from the HTML
    let payload = null;
    try {
      const payloadMatch = htmlContent.match(/id=["']quotePayload["'][^>]*>(.*?)<\/div>/s);
      if (payloadMatch && payloadMatch[1]) {
        const encodedPayload = payloadMatch[1].trim();
        const decodedPayload = decodeURIComponent(encodedPayload);
        payload = JSON.parse(decodedPayload);
        console.log("Successfully parsed quote payload");
      } else {
        console.log("No quote payload found in HTML");
      }
    } catch (parseError) {
      console.error("Error parsing quote payload:", parseError);
    }
    
    if (payload) {
      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );
      
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
      
      console.log("Quote stored successfully with ID:", data?.[0]?.id);
      
      // Redirect to quote handler with the quote ID
      const redirectUrl = new URL(req.url);
      const baseUrl = `${redirectUrl.protocol}//${redirectUrl.host}`;
      const quoteHandlerUrl = `${baseUrl}/ezyparts/quote?quote_id=${data?.[0]?.id}`;
      
      // Return a redirect response
      return new Response(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Redirecting to Quote Handler</title>
            <meta http-equiv="refresh" content="0; url=${quoteHandlerUrl}">
          </head>
          <body>
            <p>Redirecting to Quote Handler...</p>
            <script>
              window.location.href = "${quoteHandlerUrl}";
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
    } else {
      // If no payload was found, return an error
      return new Response(
        JSON.stringify({ 
          error: "No quote payload found in the HTML content" 
        }),
        { 
          status: 400,
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json"
          } 
        }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown error" 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json"
        } 
      }
    );
  }
});
