
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    // Skip for sample conversations
    if (conversationId.startsWith('sample-')) {
      console.log(`Simulating marking sample conversation ${conversationId} as read`);
      return;
    }
    
    await supabase
      .from('social_conversations')
      .update({ unread: false })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};
