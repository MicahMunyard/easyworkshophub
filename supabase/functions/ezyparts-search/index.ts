
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("=== EzyParts Search Function Called ===");

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id, search_params } = await req.json();

    if (!user_id) {
      throw new Error("User ID is required");
    }

    // Get OAuth credentials from Supabase secrets
    const clientId = Deno.env.get("BURSONS_OAUTH_NAME");
    const clientSecret = Deno.env.get("BURSONS_OAUTH_SECRET");
    const environment = Deno.env.get("EZYPARTS_ENVIRONMENT");

    if (!clientId || !clientSecret) {
      throw new Error("EzyParts OAuth credentials not configured. Please contact your administrator.");
    }

    const isProduction = environment === 'production';
    const ezyPartsUrl = isProduction 
      ? 'https://ezyparts.burson.com.au/burson/auth'
      : 'https://ezypartsqa.burson.com.au/burson/auth';

    // Construct webhook URL - Use the Supabase function URL directly
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const webhookUrl = `${supabaseUrl}/functions/v1/ezyparts-quote?user_id=${user_id}`;

    // For the web form, we use the OAuth credentials as account credentials
    const formData = {
      accountId: clientId,
      username: clientId,
      password: clientSecret,
      quoteUrl: webhookUrl,
      returnUrl: `https://app.workshopbase.com.au/inventory`,
      userAgent: 'Mozilla/5.0',
      ...(search_params.registration && {
        regoNumber: search_params.registration,
        state: search_params.state,
        isRegoSearch: 'true'
      }),
      ...(search_params.make && {
        make: search_params.make,
        model: search_params.model,
        ...(search_params.year && { year: search_params.year.toString() }),
        ...(search_params.engine && { engine: search_params.engine }),
        ...(search_params.seriesChassis && { seriesChassis: search_params.seriesChassis }),
        isRegoSearch: 'false'
      })
    };

    // Generate form HTML for auto-submission
    const formHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redirecting to EzyParts...</title>
        </head>
        <body>
          <form id="ezypartsForm" method="POST" action="${ezyPartsUrl}" style="display:none">
            ${Object.entries(formData).map(([name, value]) => 
              value ? `<input type="hidden" name="${name}" value="${value}" />` : ''
            ).join('')}
          </form>
          <script>
            document.getElementById('ezypartsForm').submit();
          </script>
          <p>Redirecting to EzyParts...</p>
        </body>
      </html>
    `;

    // Create a data URL for the form
    const dataUrl = `data:text/html;base64,${btoa(formHtml)}`;

    console.log("Search parameters prepared:", { 
      environment: isProduction ? 'production' : 'staging',
      hasCredentials: true,
      webhookUrl,
      searchType: search_params.registration ? 'registration' : 'details'
    });

    return new Response(JSON.stringify({
      success: true,
      redirect_url: dataUrl,
      webhook_url: webhookUrl
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("EzyParts search error:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to prepare EzyParts search"
    }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
