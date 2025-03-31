
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Message } from "@/types/communication";

export interface MessageBubbleProps {
  message: Message;
  isOutgoing: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isOutgoing 
}) => {
  return (
    <motion.div 
      className={cn(
        "flex",
        isOutgoing ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className={cn(
        "max-w-[75%] rounded-lg px-4 py-2",
        isOutgoing 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <p className="break-words">{message.content}</p>
        
        {message.attachment_url && (
          <a 
            href={message.attachment_url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-xs underline mt-1 block"
          >
            View attachment
          </a>
        )}
        
        <p className="text-xs opacity-70 mt-1 text-right">
          {new Date(message.sent_at || message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
