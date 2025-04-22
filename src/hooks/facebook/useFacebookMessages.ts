
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/communication';

export const useFacebookMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

    // Subscribe to new messages
    const subscription = supabase
      .channel('social_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'social_messages',
        filter: `conversation_id=eq.${conversationId}`
      }, payload => {
        const newMessage = payload.new as any;
        setMessages(prev => [...prev, {
          id: newMessage.id,
          conversation_id: newMessage.conversation_id,
          content: newMessage.content,
          sender_type: newMessage.sender_type as "user" | "contact",
          sent_at: newMessage.sent_at,
          created_at: newMessage.created_at,
          attachment_url: newMessage.attachment_url || undefined,
          isOutgoing: newMessage.sender_type === 'user'
        }]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [conversationId, toast]);

  return { messages, isLoading };
};
