
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

// Sample messages to show for sample conversations
const sampleMessagesMap: {[key: string]: Message[]} = {
  "sample-1": [
    {
      id: "msg-1-1",
      conversation_id: "sample-1",
      sender_type: "contact",
      content: "Hi there! I'm interested in booking a service for my car.",
      sent_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
    },
    {
      id: "msg-1-2",
      conversation_id: "sample-1",
      sender_type: "user",
      content: "Hello Jane! We'd be happy to help. What kind of service are you looking for?",
      sent_at: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
      id: "msg-1-3",
      conversation_id: "sample-1",
      sender_type: "contact",
      content: "I need an oil change and tire rotation for my Honda Civic 2019.",
      sent_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
      id: "msg-1-4",
      conversation_id: "sample-1",
      sender_type: "user",
      content: "Great! We can definitely help with that. When would you like to bring it in?",
      sent_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    },
    {
      id: "msg-1-5",
      conversation_id: "sample-1",
      sender_type: "contact",
      content: "Would tomorrow at 10am work?",
      sent_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    }
  ],
  "sample-2": [
    {
      id: "msg-2-1",
      conversation_id: "sample-2",
      sender_type: "user",
      content: "Hello Mike, following up on your recent service. How is your car running?",
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: "msg-2-2",
      conversation_id: "sample-2",
      sender_type: "contact",
      content: "Hi! It's running great, thanks for checking in.",
      sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
  ],
  "sample-3": [
    {
      id: "msg-3-1",
      conversation_id: "sample-3",
      sender_type: "contact",
      content: "Hello, do you provide brake services?",
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
    },
    {
      id: "msg-3-2",
      conversation_id: "sample-3",
      sender_type: "user",
      content: "Yes, we offer complete brake services including pad replacement, rotor resurfacing, and brake fluid flushes.",
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2.5).toISOString()
    },
    {
      id: "msg-3-3",
      conversation_id: "sample-3",
      sender_type: "contact",
      content: "Great! How much would it cost for a full brake service on a Toyota Camry?",
      sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ]
};

export const fetchMessages = async (conversationId: string): Promise<Message[] | null> => {
  try {
    // For sample conversations, return sample messages
    if (conversationId.startsWith('sample-')) {
      console.log(`Returning sample messages for conversation ${conversationId}`);
      return sampleMessagesMap[conversationId] || [];
    }
    
    // For real conversations, query the database
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
      sender_type: (msg.sender_type as 'user' | 'contact')
    })) as Message[];
    
    return typedData || null;
  } catch (error) {
    console.error('Error fetching messages:', error);
    toast({
      variant: "destructive",
      title: "Failed to load messages",
      description: "There was a problem loading your conversation messages."
    });
    
    // If this is a sample conversation, still try to return sample messages
    if (conversationId.startsWith('sample-')) {
      return sampleMessagesMap[conversationId] || [];
    }
    
    return null;
  }
};
