
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const cleanupDemoConversations = async (userId: string): Promise<void> => {
  try {
    // Find all conversations that have "Demo Contact" in the name
    const { data, error } = await supabase
      .from('social_conversations')
      .select('id')
      .eq('user_id', userId)
      .ilike('contact_name', '%Demo Contact%');
      
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
    const conversationIds = data.map(conv => conv.id);
    
    // First delete all messages from these conversations
    const { error: msgError } = await supabase
      .from('social_messages')
      .delete()
      .in('conversation_id', conversationIds);
      
    if (msgError) {
      console.error("Error deleting demo messages:", msgError);
    }
    
    // Then delete the conversations
    const { error: convError } = await supabase
      .from('social_conversations')
      .delete()
      .in('id', conversationIds);
      
    if (convError) {
      console.error("Error deleting demo conversations:", convError);
      return;
    }
    
    console.log(`Deleted ${data.length} demo conversations`);
  } catch (error) {
    console.error("Error cleaning up demo conversations:", error);
  }
};
