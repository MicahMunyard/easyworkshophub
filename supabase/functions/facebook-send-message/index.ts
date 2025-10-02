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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader }
      }
    });

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Authentication error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { conversation_id, message_content } = await req.json();

    if (!conversation_id || !message_content) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: conversation_id and message_content' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Sending message to conversation:', conversation_id);

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('social_conversations')
      .select('external_id, user_id, platform')
      .eq('id', conversation_id)
      .single();

    if (convError || !conversation) {
      console.error('Conversation not found:', convError);
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

    // Verify it's a Facebook conversation
    if (conversation.platform !== 'facebook') {
      return new Response(
        JSON.stringify({ error: 'Only Facebook messages are supported' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientId = conversation.external_id;

    // Get the page connection to find which page to send from
    const { data: pageConnection, error: pageError } = await supabase
      .from('social_connections')
      .select('page_id')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .eq('status', 'active')
      .single();

    if (pageError || !pageConnection) {
      console.error('No active Facebook page connection:', pageError);
      return new Response(
        JSON.stringify({ error: 'No active Facebook page connection found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get page access token
    const { data: tokenData, error: tokenError } = await supabase
      .from('facebook_page_tokens')
      .select('access_token')
      .eq('user_id', user.id)
      .eq('page_id', pageConnection.page_id)
      .single();

    if (tokenError || !tokenData) {
      console.error('Page access token not found:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Page access token not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pageAccessToken = tokenData.access_token;

    // Send message via Facebook Graph API
    const graphApiUrl = 'https://graph.facebook.com/v17.0/me/messages';
    const messagePayload = {
      recipient: { id: recipientId },
      message: { text: message_content },
      messaging_type: 'RESPONSE'
    };

    console.log('Sending to Facebook Graph API:', { recipientId, messageLength: message_content.length });

    const fbResponse = await fetch(`${graphApiUrl}?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messagePayload)
    });

    if (!fbResponse.ok) {
      const errorData = await fbResponse.json();
      console.error('Facebook API error:', errorData);
      
      // Check if token expired
      if (errorData.error?.code === 190) {
        // Update connection status to expired
        await supabase
          .from('social_connections')
          .update({ status: 'expired' })
          .eq('user_id', user.id)
          .eq('page_id', pageConnection.page_id);
          
        return new Response(
          JSON.stringify({ error: 'Facebook access token expired. Please reconnect your Facebook page.' }), 
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to send message to Facebook', details: errorData }), 
        { status: fbResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fbData = await fbResponse.json();
    console.log('Facebook API response:', fbData);

    // Store the sent message in database
    const { error: msgError } = await supabase
      .from('social_messages')
      .insert({
        conversation_id: conversation_id,
        sender_type: 'user',
        content: message_content,
        sent_at: new Date().toISOString()
      });

    if (msgError) {
      console.error('Error storing message:', msgError);
      // Don't fail the request since message was sent successfully
    }

    // Update conversation timestamp and mark as read
    await supabase
      .from('social_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread: false
      })
      .eq('id', conversation_id);

    return new Response(
      JSON.stringify({ success: true, message_id: fbData.message_id }), 
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
