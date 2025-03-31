
import React from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: any;
  isOutgoing: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOutgoing 
}) => {
  return (
    <div className={cn(
      "flex",
      isOutgoing ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "max-w-[75%] rounded-lg px-4 py-2",
        isOutgoing 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <p className="break-words">{message.content}</p>
        <p className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.sent_at || message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </div>
  );
};

export default MessageBubble;
