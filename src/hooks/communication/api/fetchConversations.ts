
import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

export const fetchConversations = async (): Promise<Conversation[] | null> => {
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
    
    // If no conversations exist, return null
    console.log("No conversations found");
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
