
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const cleanupDemoConversations = async (userId: string): Promise<void> => {
  try {
    // Find all conversations that have "Demo Contact" in the name
    const { data, error } = await supabase.rpc('find_demo_conversations', {
      user_id_param: userId
    });
      
    if (error) {
      console.error("Error finding demo conversations:", error);
      return;
    }
    
    if (!data || data.length === 0) {
      console.log("No demo conversations found");
      return;
    }
    
    console.log(`Found ${data.length} demo conversations to remove`);
    
    // Delete the demo conversations
    const conversationIds = data.map((conv: any) => conv.id);
    
    // First delete all messages from these conversations
    await supabase.rpc('delete_messages_by_conversation_ids', {
      conversation_ids: conversationIds
    });
    
    // Then delete the conversations
    await supabase.rpc('delete_conversations_by_ids', {
      conversation_ids: conversationIds
    });
    
    console.log(`Deleted ${data.length} demo conversations`);
  } catch (error) {
    console.error("Error cleaning up demo conversations:", error);
  }
};
