
import { supabase } from '@/integrations/supabase/client';

const FacebookWebhook = async (req: Request) => {
  try {
    // For GET requests (verification)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const hubMode = url.searchParams.get('hub.mode');
      const hubVerifyToken = url.searchParams.get('hub.verify_token');
      const hubChallenge = url.searchParams.get('hub.challenge');
      
      // Forward the verification request to the Supabase Edge Function
      const response = await supabase.functions.invoke('facebook-webhook', {
        method: 'GET',
        body: { 
          mode: hubMode,
          token: hubVerifyToken,
          challenge: hubChallenge 
        }
      });
      
      // If verification is successful, return the challenge
      if (response.data && response.data.challenge) {
        return new Response(response.data.challenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      return new Response(JSON.stringify({ error: 'Verification failed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For POST requests (actual webhook events)
    if (req.method === 'POST') {
      const body = await req.json();
      
      const response = await supabase.functions.invoke('facebook-webhook', {
        method: 'POST',
        body: body
      });
      
      return new Response(JSON.stringify(response.data), {
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
    console.error('Error forwarding webhook:', error);
    return new Response(JSON.stringify({ error: 'Failed to process webhook' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export default FacebookWebhook;
