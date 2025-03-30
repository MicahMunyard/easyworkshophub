
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation, Message } from "@/types/communication";
import { fetchConversations } from "./api/fetchConversations";
import { fetchMessages } from "./api/fetchMessages";
import { markConversationAsRead } from "./api/markConversationAsRead";
import { sendMessage as sendMessageApi } from "./api/sendMessage";
import { addContactToCustomers as addContactToCustomersApi } from "./api/addContactToCustomers";

export const useCommunicationState = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showContactDrawer, setShowContactDrawer] = useState(false);

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
    const data = await fetchConversations();
    if (data) {
      setConversations(data);
    }
    setIsLoading(false);
  };

  const getMessages = async (conversationId: string) => {
    if (!user) return;
    
    const data = await fetchMessages(conversationId);
    if (data) {
      setMessages(data);
    }
  };

  const sendMessage = async () => {
    if (!user || !selectedConversation || !newMessage.trim()) return;
    
    setIsSendingMessage(true);
    const success = await sendMessageApi(selectedConversation.id, newMessage.trim());
    
    if (success) {
      // Clear input and refresh data
      setNewMessage("");
      getMessages(selectedConversation.id);
      getConversations(); // Refresh conversation list for updated timestamp
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
    showContactDrawer,
    setShowContactDrawer,
    addContactToCustomers
  };
};
