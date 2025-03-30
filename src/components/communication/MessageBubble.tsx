
import React from "react";
import { Message } from "@/types/communication";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isUser }) => {
  return (
    <div className={cn(
      "flex gap-2 max-w-[80%]", 
      isUser ? "ml-auto" : "mr-auto"
    )}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>C</AvatarFallback>
        </Avatar>
      )}
      
      <div className="flex flex-col">
        <div className={cn(
          "rounded-lg p-3",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          <p className="text-sm">{message.content}</p>
          
          {message.attachment_url && (
            <a 
              href={message.attachment_url} 
              target="_blank" 
              rel="noreferrer"
              className="block mt-2 text-xs underline"
            >
              View attachment
            </a>
          )}
        </div>
        
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(message.sent_at), 'h:mm a')}
        </span>
      </div>
      
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default MessageBubble;
