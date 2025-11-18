
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Message } from "@/types/communication";
import { fetchConversations } from "./api/fetchConversations";
import { fetchMessages } from "./api/fetchMessages";
import { markConversationAsRead } from "./api/markConversationAsRead";
import { sendMessage as sendMessageApi } from "./api/sendMessage";
import { addContactToCustomers as addContactToCustomersApi } from "./api/addContactToCustomers";
import { cleanupDemoConversations } from "./api/cleanupDemoConversations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNotifications } from "@/contexts/NotificationContext";
import { generateDemoNotifications, isDemoConversation } from "@/utils/demoConversations";

// Define a type for the Facebook connection check response
interface FacebookConnectionResponse {
  has_connection: boolean;
}

export const useCommunicationState = () => {
  const { user } = useAuth();
  const { addNotification, notifications } = useNotifications();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [hasFacebookConnection, setHasFacebookConnection] = useState(false);

  // Check if user has active Facebook connection
  useEffect(() => {
    if (!user) return;
    
    const checkFacebookConnection = async () => {
      try {
        // Use a custom RPC to check for Facebook connection
        const { data, error } = await supabase.rpc('check_facebook_connection', {
          user_id_param: user.id
        });
          
        if (error) {
          console.error("Error checking Facebook connection:", error);
          return;
        }
        
        // Cast to unknown first, then to our expected type to avoid TypeScript errors
         const asJson = data as unknown as FacebookConnectionResponse | FacebookConnectionResponse[] | null;
         const hasConn = Array.isArray(asJson) ? Boolean((asJson as FacebookConnectionResponse[])[0]?.has_connection) : Boolean((asJson as FacebookConnectionResponse)?.has_connection);
         setHasFacebookConnection(hasConn);
      } catch (error) {
        console.error("Error checking Facebook connection:", error);
      }
    };
    
    checkFacebookConnection();
  }, [user]);

  // Note: Demo conversations are now handled in-memory, no cleanup needed

  // Set up conversation real-time updates
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('public:social_conversations')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'social_conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Conversation changed:', payload);
          getConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (user) {
      getConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      getMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
      
      // Update local state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === selectedConversation.id ? { ...conv, unread: false } : conv
        )
      );
    }
  }, [selectedConversation]);

  const getConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const data = await fetchConversations(user.id, true); // Enable demo mode
    if (data) {
      console.log("Fetched conversations:", data);
      setConversations(data);
      
      // Add demo notifications if we have demo conversations and no message notifications yet
      const hasDemoConversations = data.some(conv => isDemoConversation(conv.id));
      const hasMessageNotifications = notifications.some(n => n.type === 'message_received');
      
      if (hasDemoConversations && !hasMessageNotifications) {
        const demoNotifications = generateDemoNotifications();
        demoNotifications.forEach(notification => {
          addNotification(notification);
        });
      }
    } else {
      console.log("No conversations found");
    }
    setIsLoading(false);
  };

  const getMessages = async (conversationId: string) => {
    if (!user) return;
    
    const data = await fetchMessages(conversationId);
    if (data) {
      console.log("Fetched messages for conversation", conversationId, ":", data);
      setMessages(data);
    } else {
      console.log("No messages found for conversation", conversationId);
      setMessages([]);
    }
  };

  const addMessage = useCallback((message: Message) => {
    console.log("Adding new message to state:", message);
    setMessages(prev => [...prev, message]);
  }, []);

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    const success = await sendMessageApi(selectedConversation.id, newMessage.trim());
    
    if (success) {
      // Clear input
      setNewMessage("");
      
      // For sample conversations, manually add the message to the UI
      // since there's no real-time updates for them
      if (selectedConversation.id.startsWith('sample-')) {
        const newMsg: Message = {
          id: `manual-${Date.now()}`,
          conversation_id: selectedConversation.id,
          sender_type: 'user',
          content: newMessage.trim(),
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          isOutgoing: true
        };
        addMessage(newMsg);
      }
      
      // Refresh conversation list for updated timestamp
      getConversations();
    }
    
    setIsSendingMessage(false);
  };

  const addContactToCustomers = async (conversation: Conversation) => {
    if (!user || !conversation) return;
    
    await addContactToCustomersApi(user.id, conversation);
  };

  return {
    conversations,
    selectedConversation,
    setSelectedConversation,
    messages,
    isLoading,
    newMessage,
    setNewMessage,
    sendMessage,
    isSendingMessage,
    fetchConversations: getConversations,
    addContactToCustomers,
    addMessage,
    hasFacebookConnection
  };
};
