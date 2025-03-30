
import React, { useRef, useEffect } from "react";
import { Conversation, Message } from "@/types/communication";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Info } from "lucide-react";
import { formatRelative } from "date-fns";
import MessageBubble from "./MessageBubble";

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isSendingMessage: boolean;
  onContactInfoClick: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  onContactInfoClick
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={conversation.profile_picture_url} alt={conversation.contact_name} />
            <AvatarFallback>{getInitials(conversation.contact_name)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{conversation.contact_name}</h3>
            <p className="text-xs text-muted-foreground">{conversation.contact_handle}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onContactInfoClick}>
          <Info className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No messages yet
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isUser={message.sender_type === 'user'}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Message Input */}
      <div className="p-3 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] resize-none"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || isSendingMessage}
            size="icon"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageThread;
