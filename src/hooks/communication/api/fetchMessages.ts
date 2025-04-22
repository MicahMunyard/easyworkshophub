
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

export const fetchMessages = async (conversationId: string): Promise<Message[] | null> => {
  try {
    const { data, error } = await supabase
      .from('social_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('sent_at', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Cast the data to ensure it matches our Message type
    const typedData = data?.map(msg => ({
      ...msg,
      sender_type: (msg.sender_type as 'user' | 'contact'),
      isOutgoing: msg.sender_type === 'user'
    })) as Message[];
    
    return typedData || null;
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast({
      variant: "destructive",
      title: "Failed to load messages",
      description: "There was a problem loading your conversation messages."
    });
    
    return null;
  }
};
