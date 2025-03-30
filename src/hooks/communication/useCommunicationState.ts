
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, Message } from "@/types/communication";
import { useToast } from "@/components/ui/use-toast";

export const useCommunicationState = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markConversationAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  const fetchConversations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Cast the data to ensure it matches our Conversation type
      const typedData = data?.map(conv => ({
        ...conv,
        platform: (conv.platform as 'facebook' | 'instagram' | 'tiktok' | 'other')
      })) as Conversation[];
      
      setConversations(typedData || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        variant: "destructive",
        title: "Failed to load conversations",
        description: "There was a problem loading your conversations."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!user) return;
    
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
        sender_type: (msg.sender_type as 'user' | 'contact')
      })) as Message[];
      
      setMessages(typedData || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Failed to load messages",
        description: "There was a problem loading your conversation messages."
      });
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    try {
      // Add message to database
      const { error } = await supabase
        .from('social_messages')
        .insert({
          conversation_id: selectedConversation.id,
          sender_type: 'user',
          content: newMessage.trim(),
          sent_at: new Date().toISOString()
        });
        
      if (error) {
        throw error;
      }
      
      // Update conversation's last_message_at
      await supabase
        .from('social_conversations')
        .update({
          last_message_at: new Date().toISOString(),
          unread: false
        })
        .eq('id', selectedConversation.id);
      
      // Clear input and refresh messages
      setNewMessage("");
      fetchMessages(selectedConversation.id);
      fetchConversations(); // Refresh conversation list for updated timestamp
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Failed to send message",
        description: "Your message could not be sent. Please try again."
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const markConversationAsRead = async (conversationId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('social_conversations')
        .update({ unread: false })
        .eq('id', conversationId);
        
      // Update local state
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId ? { ...conv, unread: false } : conv
        )
      );
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const addContactToCustomers = async (conversation: Conversation) => {
    if (!user || !conversation) return;
    
    try {
      // Check if customer already exists with this name and/or handle
      const { data: existingCustomers, error: lookupError } = await supabase
        .from('user_customers')
        .select('*')
        .eq('user_id', user.id)
        .or(`name.eq.${conversation.contact_name},phone.eq.${conversation.contact_handle}`);
        
      if (lookupError) {
        throw lookupError;
      }
      
      // If customer doesn't exist, create a new one
      if (!existingCustomers || existingCustomers.length === 0) {
        const { error: createError } = await supabase
          .from('user_customers')
          .insert({
            user_id: user.id,
            name: conversation.contact_name,
            phone: conversation.contact_handle,
            status: 'active',
            created_at: new Date().toISOString()
          });
          
        if (createError) {
          throw createError;
        }
        
        toast({
          title: "Customer Added",
          description: `${conversation.contact_name} has been added to your customers.`
        });
      } else {
        toast({
          title: "Customer Already Exists",
          description: `${conversation.contact_name} is already in your customer database.`
        });
      }
    } catch (error) {
      console.error('Error adding contact to customers:', error);
      toast({
        variant: "destructive",
        title: "Failed to add customer",
        description: "There was a problem adding this contact to your customers."
      });
    }
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
    fetchConversations,
    showContactDrawer,
    setShowContactDrawer,
    addContactToCustomers
  };
};
