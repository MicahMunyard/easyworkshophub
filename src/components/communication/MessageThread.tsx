
import React, { useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Textarea } from "@/components/ui/textarea";
import { useFacebookMessages } from "@/hooks/facebook/useFacebookMessages";
import { Conversation, Message } from "@/types/communication";

interface MessageThreadProps {
  conversation: Conversation | null;
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isSendingMessage: boolean;
  onContactInfoClick: () => void;
  onBackClick?: () => void;
  isMobile: boolean;
  addMessage: (message: Message) => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  onContactInfoClick,
  onBackClick,
  isMobile,
  addMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isLoading } = useFacebookMessages(conversation?.id || null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <p className="text-muted-foreground">Select a conversation to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-4 flex items-center gap-2">
        {isMobile && onBackClick && (
          <Button variant="ghost" size="icon" onClick={onBackClick}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <h3 className="font-semibold">{conversation.contact_name}</h3>
          <p className="text-sm text-muted-foreground">
            {conversation.platform.charAt(0).toUpperCase() + conversation.platform.slice(1)}
          </p>
        </div>
        <Button variant="outline" onClick={onContactInfoClick}>
          Contact Info
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center p-4">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOutgoing={message.isOutgoing}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <Card className="rounded-none border-t border-b-0 border-x-0">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
            />
            <Button 
              onClick={sendMessage}
              disabled={isSendingMessage || !newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessageThread;
