
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
    
    // For real conversations, add to database
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
