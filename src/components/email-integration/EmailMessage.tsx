
import React, { useState, useEffect } from "react";
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { EmailType } from "@/types/email";
import EmailReplyForm from "./EmailReplyForm";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import EmailStatusBadge from "./email-message/EmailStatusBadge";
import BookingDetails from "./email-message/BookingDetails";
import ConversationThread from "./email-message/ConversationThread";
import DOMPurify from "dompurify";

interface EmailMessageProps {
  email: EmailType;
  onCreateBooking: () => Promise<boolean>;
  onReply: (content: string) => Promise<boolean>;
  bookingCreated: boolean;
  isPotentialBooking: boolean;
  isProcessing: boolean;
}

const EmailMessage: React.FC<EmailMessageProps> = ({ 
  email, 
  onCreateBooking,
  onReply,
  bookingCreated,
  isPotentialBooking,
  isProcessing
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [conversation, setConversation] = useState<EmailType[]>([]);
  const [isLoadingConversation, setIsLoadingConversation] = useState(false);
  const { fetchConversationThread } = useEmailIntegration();

  useEffect(() => {
    const loadConversation = async () => {
      if (!email.id) return;
      
      try {
        setIsLoadingConversation(true);
        const thread = await fetchConversationThread(email.id);
        setConversation(thread.filter(msg => msg.id !== email.id));
      } catch (error) {
        console.error("Error loading conversation:", error);
      } finally {
        setIsLoadingConversation(false);
      }
    };
    
    loadConversation();
  }, [email.id, fetchConversationThread]);

  const extractedDetails = email.extracted_details || {
    name: null,
    phone: null,
    date: null,
    time: null,
    service: null,
    vehicle: null
  };

  // Sanitize HTML content with limited allowed tags and attributes
  const sanitizedEmailContent = DOMPurify.sanitize(email.content, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target']
  });

  return (
    <>
      <CardHeader className="border-b pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl mb-1">{email.subject}</CardTitle>
            <div className="text-sm text-muted-foreground mb-1">
              From: <span className="font-medium">{email.from}</span> ({email.sender_email})
            </div>
            <div className="text-sm text-muted-foreground">
              Date: {new Date(email.date).toLocaleDateString()} at {new Date(email.date).toLocaleTimeString()}
            </div>
          </div>
          <EmailStatusBadge
            bookingCreated={bookingCreated}
            isProcessing={isProcessing}
            processingStatus={email.processing_status}
            isPotentialBooking={isPotentialBooking}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div 
          className="prose prose-sm max-w-none" 
          dangerouslySetInnerHTML={{ __html: sanitizedEmailContent }}
        />
        
        {isPotentialBooking && !bookingCreated && (
          <BookingDetails extractedDetails={extractedDetails} />
        )}
        
        {showReplyForm && (
          <EmailReplyForm 
            email={email} 
            onSendReply={onReply}
            onCancel={() => setShowReplyForm(false)}
          />
        )}
      </CardContent>
      
      {!showReplyForm && (
        <CardFooter className="border-t pt-3 flex justify-between">
          <div>
            {isPotentialBooking && !bookingCreated && (
              <Button 
                variant="default" 
                onClick={onCreateBooking}
                disabled={bookingCreated || isProcessing}
                className="gap-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                  </>
                ) : (
                  "Create Booking from Email"
                )}
              </Button>
            )}
          </div>
          <div>
            <Button 
              variant="outline"
              className="gap-1"
              onClick={() => setShowReplyForm(true)}
            >
              <Mail className="h-4 w-4" /> Reply
            </Button>
          </div>
        </CardFooter>
      )}
      
      <ConversationThread
        conversation={conversation}
        isLoadingConversation={isLoadingConversation}
      />
    </>
  );
};

export default EmailMessage;
