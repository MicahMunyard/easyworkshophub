
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/communication";
import { toast } from "@/hooks/use-toast";

export const useRealtimeMessages = (
  conversationId: string | null,
  onNewMessage: (message: Message) => void
) => {
  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to real-time updates for this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message received', payload);
          // Cast the new message to our Message type
          const newMessage = payload.new as Message;
          onNewMessage(newMessage);
        }
      )
      .subscribe((status) => {
        if (status !== 'SUBSCRIBED') {
          console.error('Failed to subscribe to real-time messages', status);
        } else {
          console.log('Subscribed to real-time messages for conversation', conversationId);
        }
      });

    // Cleanup function to remove the channel when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage]);
};
