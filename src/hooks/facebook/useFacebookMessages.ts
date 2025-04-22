
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/communication';
import { useRealtimeMessages } from '../communication/useRealtimeMessages';

export const useFacebookMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial messages
  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('social_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('sent_at', { ascending: true });

        if (error) throw error;

        const formattedMessages: Message[] = data.map(msg => ({
          id: msg.id,
          conversation_id: msg.conversation_id,
          content: msg.content,
          sender_type: msg.sender_type as "user" | "contact",
          sent_at: msg.sent_at,
          created_at: msg.created_at,
          attachment_url: msg.attachment_url || undefined,
          isOutgoing: msg.sender_type === 'user'
        }));

        setMessages(formattedMessages);
        console.log('Fetched messages:', formattedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load messages"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId, toast]);

  // Handle adding new messages
  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, {
      ...message,
      isOutgoing: message.sender_type === 'user'
    }]);
  };

  // Use the realtime messages hook to subscribe to new messages
  useRealtimeMessages(conversationId, addMessage);

  return { 
    messages, 
    isLoading,
    addMessage 
  };
};
