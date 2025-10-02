import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

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
    const { conversation_id, content } = await req.json();
    
    if (!conversation_id || !content) {
      return new Response(
        JSON.stringify({ error: 'Missing conversation_id or content' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get JWT token from request
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user is authenticated
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('social_conversations')
      .select('external_id, platform, user_id')
      .eq('id', conversation_id)
      .single();
      
    if (convError || !conversation) {
      console.error('Error fetching conversation:', convError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify user owns this conversation
    if (conversation.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Only process Facebook messages
    if (conversation.platform !== 'facebook') {
      return new Response(
        JSON.stringify({ error: 'This function only handles Facebook messages' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get page access token for this user
    const { data: connections, error: connError } = await supabase
      .from('social_connections')
      .select('page_id, page_access_token')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .eq('status', 'active')
      .limit(1);
      
    if (connError || !connections || connections.length === 0) {
      console.error('Error fetching page token:', connError);
      return new Response(
        JSON.stringify({ error: 'No active Facebook connection found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const pageAccessToken = connections[0].page_access_token;
    
    if (!pageAccessToken) {
      return new Response(
        JSON.stringify({ error: 'Page access token not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Send message via Facebook Graph API
    const senderId = conversation.external_id;
    const graphApiUrl = `https://graph.facebook.com/v17.0/me/messages`;
    
    const messagePayload = {
      recipient: { id: senderId },
      message: { text: content.trim() }
    };
    
    console.log('Sending Facebook message:', { senderId, messageLength: content.length });
    
    const fbResponse = await fetch(graphApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...messagePayload,
        access_token: pageAccessToken
      })
    });
    
    if (!fbResponse.ok) {
      const errorText = await fbResponse.text();
      console.error('Facebook API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send message via Facebook', details: errorText }),
        { status: fbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const fbData = await fbResponse.json();
    console.log('Facebook message sent:', fbData);
    
    // Store the message in database
    const { error: msgError } = await supabase
      .from('social_messages')
      .insert({
        conversation_id,
        sender_type: 'user',
        content: content.trim(),
        sent_at: new Date().toISOString()
      });
      
    if (msgError) {
      console.error('Error storing message:', msgError);
      // Message was sent but not stored - not critical
    }
    
    // Update conversation timestamp
    await supabase
      .from('social_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread: false
      })
      .eq('id', conversation_id);
    
    return new Response(
      JSON.stringify({ success: true, facebook_response: fbData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in facebook-send-message:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
