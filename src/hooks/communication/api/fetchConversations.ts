
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";
import { toast } from "@/hooks/use-toast";
import { generateDemoConversations } from "@/utils/demoConversations";

export const fetchConversations = async (userId?: string, showDemoIfEmpty: boolean = false): Promise<Conversation[] | null> => {
  try {
    const { data, error } = await supabase
      .from('social_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // If we have real data, use it
    if (data && data.length > 0) {
      // Cast the data to ensure it matches our Conversation type
      const typedData = data.map(conv => ({
        ...conv,
        platform: (conv.platform as 'facebook' | 'instagram' | 'tiktok' | 'other')
      })) as Conversation[];
      
      return typedData;
    } 
    
    // If no conversations exist, check if we should show demo data
    console.log("No conversations found");
    
    if (showDemoIfEmpty && userId) {
      // Check if user has connected Facebook pages
      const { data: pageTokens, error: pageError } = await supabase
        .from('facebook_page_tokens')
        .select('id')
        .eq('user_id', userId)
        .limit(1);
      
      if (!pageError && pageTokens && pageTokens.length > 0) {
        console.log("Returning demo conversations");
        return generateDemoConversations(userId);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast({
      variant: "destructive",
      title: "Failed to load conversations",
      description: "There was a problem loading your conversations."
    });
    
    return null;
  }
};
