
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  try {
    await supabase
      .from('social_conversations')
      .update({ unread: false })
      .eq('id', conversationId);
  } catch (error) {
    console.error('Error marking conversation as read:', error);
  }
};
