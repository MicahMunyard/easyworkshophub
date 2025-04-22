
import React from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/communication";

interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOutgoing }) => {
  return (
    <div className={cn("flex", isOutgoing ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-lg p-3",
          isOutgoing
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <div className="break-words">
          {message.content}
        </div>
        {message.attachment_url && (
          <div className="mt-2">
            <img 
              src={message.attachment_url} 
              alt="Attachment" 
              className="max-w-full rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
        <div className={cn(
          "text-xs mt-1",
          isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          {new Date(message.sent_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
