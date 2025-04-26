
import React from "react";
import { Loader2 } from "lucide-react";
import { EmailType } from "@/types/email";
import DOMPurify from "dompurify";

interface ConversationThreadProps {
  conversation: EmailType[];
  isLoadingConversation: boolean;
}

const ConversationThread: React.FC<ConversationThreadProps> = ({
  conversation,
  isLoadingConversation,
}) => {
  if (!conversation.length) return null;

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Conversation:</h3>
      {isLoadingConversation ? (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Loading conversation...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {conversation
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(msg => (
              <div key={msg.id} className="p-2 rounded bg-muted">
                <div className="text-xs text-muted-foreground mb-1">
                  {msg.from} &lt;{msg.sender_email}&gt; - {new Date(msg.date).toLocaleString()}
                </div>
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(msg.content, { 
                      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
                      ALLOWED_ATTR: ['href', 'target']
                    })
                  }} 
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ConversationThread;
