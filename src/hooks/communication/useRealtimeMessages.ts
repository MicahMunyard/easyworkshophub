
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/communication";
import { useNotifications } from "@/contexts/NotificationContext";

export const useRealtimeMessages = (
  conversationId: string | null,
  onNewMessage: (message: Message) => void,
  contactName?: string
) => {
  const { addNotification, preferences } = useNotifications();
  
  useEffect(() => {
    if (!conversationId) return;

    console.log(`Setting up realtime subscription for conversation: ${conversationId}`);

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
          console.log('New message received via realtime:', payload);
          // Cast the new message to our Message type
          const newMessage = payload.new as any;
          const typedMessage: Message = {
            id: newMessage.id,
            conversation_id: newMessage.conversation_id,
            content: newMessage.content,
            sender_type: newMessage.sender_type as "user" | "contact",
            sent_at: newMessage.sent_at,
            created_at: newMessage.created_at,
            attachment_url: newMessage.attachment_url || undefined,
            isOutgoing: newMessage.sender_type === 'user'
          };
          onNewMessage(typedMessage);
          
          // Add notification for incoming messages if preferences allow
          if (typedMessage.sender_type === 'contact' && preferences.messageReceived) {
            addNotification({
              title: `New message from ${contactName || 'Customer'}`,
              message: typedMessage.content.length > 50 
                ? typedMessage.content.substring(0, 50) + '...' 
                : typedMessage.content,
              type: "message_received",
              priority: "medium",
              actionData: {
                conversationId: typedMessage.conversation_id,
                contactName: contactName || 'Customer',
                messagePreview: typedMessage.content
              }
            });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${conversationId}:`, status);
      });

    // Cleanup function to remove the channel when component unmounts
    return () => {
      console.log(`Removing realtime subscription for conversation: ${conversationId}`);
      supabase.removeChannel(channel);
    };
  }, [conversationId, onNewMessage, contactName, preferences.messageReceived, addNotification]);
};
