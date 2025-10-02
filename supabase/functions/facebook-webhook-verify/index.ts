import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const VERIFY_TOKEN = 'wsb_fb_hook_a7d93bf52c14e9f8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Handle GET requests (webhook verification)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Webhook verification request:', { mode, token, challenge });

      // Check if a token and mode were sent
      if (mode && token) {
        // Check the mode and token sent are correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
          // Respond with 200 OK and challenge token from the request
          console.log('Webhook verified successfully');
          return new Response(challenge, {
            status: 200,
            headers: { 'Content-Type': 'text/plain' }
          });
        } else {
          // Responds with '403 Forbidden' if verify tokens do not match
          console.error('Verification token mismatch');
          return new Response('Forbidden', { status: 403 });
        }
      }
    }
    
    // Handle unsupported methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error in webhook verification:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
