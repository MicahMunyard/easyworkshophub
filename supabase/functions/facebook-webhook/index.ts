
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.23.0';

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
    // Handle POST requests (incoming messages)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Processing webhook data:', JSON.stringify(body));
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Process Facebook webhook events
      if (body.object === 'page') {
        for (const entry of body.entry) {
          for (const messaging of entry.messaging || []) {
            const senderId = messaging.sender.id;
            const pageId = messaging.recipient.id;
            
            // Get the associated user for this page
            const { data: pageData, error: pageError } = await supabase
              .from('social_connections')
              .select('user_id')
              .eq('page_id', pageId)
              .eq('platform', 'facebook')
              .eq('status', 'active')
              .single();
              
            if (pageError || !pageData) {
              console.error('Error finding page connection:', pageError);
              continue;
            }
            
            const userId = pageData.user_id;
            
            // Check if a conversation already exists
            const { data: existingConv, error: convError } = await supabase
              .from('social_conversations')
              .select('id')
              .eq('user_id', userId)
              .eq('platform', 'facebook')
              .eq('external_id', senderId)
              .single();
              
            let conversationId;
            
            if (convError || !existingConv) {
              // Create a new conversation
              try {
                // Fetch sender profile from Facebook
                const pageAccessToken = await getPageAccessToken(supabase, pageId);
                const profile = await fetchSenderProfile(senderId, pageAccessToken);
                
                const { data: newConv, error: createError } = await supabase
                  .from('social_conversations')
                  .insert({
                    user_id: userId,
                    platform: 'facebook',
                    external_id: senderId,
                    contact_name: profile.name || 'Facebook User',
                    profile_picture_url: profile.profile_pic || null,
                    last_message_at: new Date().toISOString(),
                    unread: true
                  })
                  .select('id')
                  .single();
                  
                if (createError) {
                  console.error('Error creating conversation:', createError);
                  continue;
                }
                
                conversationId = newConv.id;
              } catch (error) {
                console.error('Error creating conversation:', error);
                continue;
              }
            } else {
              conversationId = existingConv.id;
              
              // Update conversation to mark as unread with new timestamp
              await supabase
                .from('social_conversations')
                .update({
                  last_message_at: new Date().toISOString(),
                  unread: true
                })
                .eq('id', conversationId);
            }
            
            // Store the message
            if (messaging.message) {
              const { error: msgError } = await supabase
                .from('social_messages')
                .insert({
                  conversation_id: conversationId,
                  sender_type: 'contact',
                  content: messaging.message.text || '(Media or attachment)',
                  attachment_url: messaging.message.attachments?.[0]?.payload?.url || null,
                  sent_at: new Date().toISOString()
                });
                
              if (msgError) {
                console.error('Error storing message:', msgError);
              }
            }
          }
        }
      }
      
      // Always return a 200 OK to Facebook promptly
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      });
    }
    
    // Handle unsupported methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { 
      status: 405,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      } 
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 
        ...corsHeaders,
        'Content-Type': 'application/json'
      } 
    });
  }
});

// Helper function to get page access token
async function getPageAccessToken(supabase, pageId) {
  const { data, error } = await supabase
    .from('facebook_page_tokens')
    .select('access_token')
    .eq('page_id', pageId)
    .single();
    
  if (error || !data) {
    throw new Error(`Page access token not found for page ${pageId}`);
  }
  
  return data.access_token;
}

// Helper function to fetch sender profile from Facebook
async function fetchSenderProfile(senderId, pageAccessToken) {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${senderId}?fields=name,profile_pic&access_token=${pageAccessToken}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${await response.text()}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching sender profile:', error);
    return { name: 'Facebook User', profile_pic: null };
  }
}
