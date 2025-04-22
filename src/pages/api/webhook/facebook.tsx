
// This is a Next.js API route handler, not a React component
import { supabase } from '@/integrations/supabase/client';

// Facebook verification token - this should match what you set in Facebook Developer Portal
const FACEBOOK_VERIFY_TOKEN = 'wsb_fb_hook_a7d93bf52c14e9f8';

// Export a default function to handle the Facebook webhook requests
export default async function handler(req: Request) {
  try {
    // For GET requests (verification)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const hubMode = url.searchParams.get('hub.mode');
      const hubVerifyToken = url.searchParams.get('hub.verify_token');
      const hubChallenge = url.searchParams.get('hub.challenge');
      
      console.log('Webhook verification request:', { hubMode, hubVerifyToken });
      
      // Verify the token directly in the API route
      if (hubMode === 'subscribe' && hubVerifyToken === FACEBOOK_VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return new Response(hubChallenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      console.error('Webhook verification failed: invalid token or mode');
      return new Response(JSON.stringify({ error: 'Verification failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For POST requests (actual webhook events)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook event:', JSON.stringify(body));
      
      // Forward webhook events to our Supabase function for processing
      const response = await supabase.functions.invoke('facebook-webhook', {
        method: 'POST',
        body: body
      });
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Handle other methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
