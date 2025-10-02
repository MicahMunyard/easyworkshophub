
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export const sendMessage = async (conversationId: string, content: string): Promise<boolean> => {
  try {
    // For sample conversations, simulate sending a message
    if (conversationId.startsWith('sample-')) {
      console.log(`Simulating sending message to sample conversation ${conversationId}: ${content}`);
      
      // Simulate a delay to make it feel realistic
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    }
    
    // Get conversation to check platform
    const { data: conversation, error: convError } = await supabase
      .from('social_conversations')
      .select('platform')
      .eq('id', conversationId)
      .single();
      
    if (convError) {
      throw convError;
    }
    
    // For Facebook conversations, use the edge function to send via Graph API
    if (conversation?.platform === 'facebook') {
      const { data, error } = await supabase.functions.invoke('facebook-send-message', {
        body: {
          conversation_id: conversationId,
          content: content
        }
      });
      
      if (error) {
        console.error('Error calling facebook-send-message:', error);
        throw new Error('Failed to send Facebook message');
      }
      
      if (!data?.success) {
        throw new Error('Facebook message send failed');
      }
      
      return true;
    }
    
    // For other platforms, just store in database
    const { error } = await supabase
      .from('social_messages')
      .insert({
        conversation_id: conversationId,
        sender_type: 'user',
        content: content.trim(),
        sent_at: new Date().toISOString()
      });
      
    if (error) {
      throw error;
    }
    
    // Update conversation's last_message_at
    await supabase
      .from('social_conversations')
      .update({
        last_message_at: new Date().toISOString(),
        unread: false
      })
      .eq('id', conversationId);
    
    return true;
  } catch (error) {
    console.error('Error sending message:', error);
    toast({
      variant: "destructive",
      title: "Failed to send message",
      description: "Your message could not be sent. Please try again."
    });
    return false;
  }
};
