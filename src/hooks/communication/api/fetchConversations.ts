import { supabase } from "@/integrations/supabase/client";
import { Conversation } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

// Sample data to show when no real conversations exist
const sampleConversations: Conversation[] = [
  {
    id: "sample-1",
    user_id: "123",
    platform: "facebook",
    external_id: "fb-1234567890",
    contact_name: "Jane Smith",
    contact_handle: "jane.smith.123",
    profile_picture_url: "https://randomuser.me/api/portraits/women/65.jpg",
    last_message_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    unread: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: "sample-2",
    user_id: "123",
    platform: "facebook",
    external_id: "fb-2345678901",
    contact_name: "Mike Johnson",
    contact_handle: "mike.johnson.456",
    profile_picture_url: "https://randomuser.me/api/portraits/men/32.jpg",
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    unread: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), // 10 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: "sample-3",
    user_id: "123",
    platform: "instagram",
    external_id: "ig-3456789012",
    contact_name: "Sarah Williams",
    contact_handle: "sarah_williams",
    profile_picture_url: "https://randomuser.me/api/portraits/women/44.jpg",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    unread: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  }
];

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
    
    // Otherwise, return our sample conversations
    console.log("No real conversations found, using sample data");
    return sampleConversations;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    toast({
      variant: "destructive",
      title: "Failed to load conversations",
      description: "There was a problem loading your conversations."
    });
    
    // If there's an error, still return sample data so the UI has something to show
    return sampleConversations;
  }
};
