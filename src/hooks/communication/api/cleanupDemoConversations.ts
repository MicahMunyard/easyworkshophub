
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const cleanupDemoConversations = async (userId: string): Promise<void> => {
  try {
    console.log("Starting cleanup of demo conversations for user", userId);
    
    // Delete all demo conversations by matching external_id patterns
    // Demo conversations have external_id like: facebook-*, instagram-*, tiktok-*
    const { error } = await supabase
      .from('social_conversations')
      .delete()
      .eq('user_id', userId)
      .or('external_id.like.facebook-%,external_id.like.instagram-%,external_id.like.tiktok-%');
    
    if (error) {
      console.error("Error cleaning up demo conversations:", error);
    } else {
      console.log("Demo conversations cleanup completed");
    }
  } catch (error) {
    console.error("Error in demo data cleanup:", error);
  }
};
