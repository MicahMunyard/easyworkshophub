
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send, UserRound, ArrowLeft } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { Textarea } from "@/components/ui/textarea";

interface MessageThreadProps {
  conversation: any;
  messages: any[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isSendingMessage: boolean;
  onContactInfoClick: () => void;
  onBackClick?: () => void;
  isMobile?: boolean;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  onContactInfoClick,
  onBackClick,
  isMobile = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with contact info and back button for mobile */}
      <div className="flex items-center justify-between p-3 border-b">
        {isMobile && onBackClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBackClick} 
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex items-center flex-1">
          <UserRound className="h-6 w-6 mr-2 text-muted-foreground" />
          <div>
            <h3 className="font-medium text-sm">
              {conversation.name || 'Unknown Contact'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {conversation.platform} • {conversation.lastMessageTime ? new Date(conversation.lastMessageTime).toLocaleDateString() : 'No messages'}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onContactInfoClick}
          className={isMobile ? "hidden" : ""}
        >
          Contact Info
        </Button>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message} 
              isOutgoing={message.isOutgoing}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">No messages yet</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="min-h-[60px] max-h-[120px] resize-none"
          />
          <Button 
            onClick={sendMessage}
            disabled={isSendingMessage || !newMessage.trim()}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
