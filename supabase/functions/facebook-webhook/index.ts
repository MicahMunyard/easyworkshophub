import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

// CORS headers for browser requests
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const verifyToken = Deno.env.get('FACEBOOK_VERIFY_TOKEN') as string;
    
    console.log('📞 Webhook request received:', req.method);
    
    // Handle GET requests (Facebook webhook verification)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      console.log('🔐 Verification request:', { mode, token: token?.substring(0, 10) + '...', challenge: challenge?.substring(0, 10) + '...' });
      
      if (mode === 'subscribe' && token === verifyToken) {
        console.log('✅ Webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      console.error('❌ Verification failed: invalid token or mode');
      return new Response('Forbidden', { status: 403 });
    }
    
    // Handle POST requests (incoming messages)
    if (req.method === 'POST') {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const body = await req.json();
      
      console.log('📨 Webhook POST body:', JSON.stringify(body, null, 2));
      
      // Process each entry in the webhook payload
      if (body.object === 'page') {
        for (const entry of body.entry || []) {
          const pageId = entry.id;
          console.log('📄 Processing entry for page:', pageId);
          
          // Find the user who owns this page
          const { data: pageToken, error: pageError } = await supabase
            .from('facebook_page_tokens')
            .select('user_id, page_name')
            .eq('page_id', pageId)
            .maybeSingle();
          
          if (pageError || !pageToken) {
            console.error('❌ Page not found in database:', pageId, pageError);
            continue;
          }
          
          console.log('👤 Found page owner:', pageToken.user_id);
          
          // Process messaging events
          for (const messaging of entry.messaging || []) {
            console.log('💬 Processing messaging event:', JSON.stringify(messaging, null, 2));
            
            const senderId = messaging.sender.id;
            const recipientId = messaging.recipient.id;
            const messageText = messaging.message?.text || '';
            const timestamp = new Date(messaging.timestamp);
            
            // Determine if this is from customer or sent by page
            const isFromCustomer = senderId !== pageId;
            const contactId = isFromCustomer ? senderId : recipientId;
            
            console.log('📧 Message details:', {
              from: senderId,
              to: recipientId,
              isFromCustomer,
              contactId,
              text: messageText.substring(0, 50) + '...'
            });
            
            // Upsert conversation
            const externalId = `facebook-${contactId}`;
            const { data: conversation, error: convError } = await supabase
              .from('social_conversations')
              .upsert({
                user_id: pageToken.user_id,
                platform: 'facebook',
                external_id: externalId,
                contact_handle: contactId,
                contact_name: `Facebook User ${contactId.substring(0, 8)}`,
                last_message_at: timestamp.toISOString(),
                unread: isFromCustomer
              }, {
                onConflict: 'user_id,external_id',
                ignoreDuplicates: false
              })
              .select()
              .single();
            
            if (convError) {
              console.error('❌ Error upserting conversation:', convError);
              continue;
            }
            
            console.log('✅ Conversation upserted:', conversation.id);
            
            // Insert message
            const { error: msgError } = await supabase
              .from('social_messages')
              .insert({
                conversation_id: conversation.id,
                sender_type: isFromCustomer ? 'contact' : 'user',
                content: messageText,
                sent_at: timestamp.toISOString()
              });
            
            if (msgError) {
              console.error('❌ Error inserting message:', msgError);
              continue;
            }
            
            console.log('✅ Message inserted successfully');
          }
        }
      }
      
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Method not allowed', { status: 405 });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
