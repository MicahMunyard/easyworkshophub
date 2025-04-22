
import { supabase } from '@/integrations/supabase/client';

// Facebook verification token
const FACEBOOK_VERIFY_TOKEN = 'wsb_fb_hook_a7d93bf52c14e9f8';

export default async function handler(req, res) {
  try {
    // For GET requests (verification)
    if (req.method === 'GET') {
      const hubMode = req.query['hub.mode'];
      const hubVerifyToken = req.query['hub.verify_token'];
      const hubChallenge = req.query['hub.challenge'];
      
      console.log('Webhook verification request:', { hubMode, hubVerifyToken });
      
      // Verify the token directly in the API route
      if (hubMode === 'subscribe' && hubVerifyToken === FACEBOOK_VERIFY_TOKEN) {
        console.log('Webhook verified successfully');
        return res.status(200).send(hubChallenge);
      }
      
      console.error('Webhook verification failed: invalid token or mode');
      return res.status(403).json({ error: 'Verification failed' });
    }
    
    // For POST requests (actual webhook events)
    if (req.method === 'POST') {
      // Forward to Supabase function
      const response = await supabase.functions.invoke('facebook-webhook', {
        method: 'POST',
        body: req.body
      });
      
      return res.status(200).json({ success: true });
    }
    
    // Handle other methods
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
}
