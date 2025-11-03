
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import { EmailType } from "@/types/email";
import EmailListPanel from "./EmailListPanel";
import EmailDetailPanel from "./EmailDetailPanel";
import EmailComposeForm from "./EmailComposeForm";

interface EmailInboxProps {
  onOpenBookingModal: (email: EmailType) => void;
}

const EmailInbox: React.FC<EmailInboxProps> = ({ onOpenBookingModal }) => {
  const { toast } = useToast();
  const {
    emails,
    isLoading,
    selectedEmail,
    setSelectedEmail,
    processingEmailId,
    refreshEmails,
    createBookingFromEmail,
    replyToEmail,
    fetchEmailsByFolder,
  } = useEmailIntegration();

  const [folder, setFolder] = useState<"inbox" | "sent" | "junk">("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposeForm, setShowComposeForm] = useState(false);

  // Automatically fetch emails when component mounts or folder changes
  useEffect(() => {
    refreshEmails(folder);
  }, [folder, refreshEmails]);

  const handleCreateBooking = async (email: EmailType) => {
    // Open the booking modal instead of automatically creating booking
    onOpenBookingModal(email);
    return true;
  };

  const handleSendReply = async (content: string) => {
    if (!selectedEmail) return false;
    return await replyToEmail(selectedEmail, content);
  };

  const handleSendNewEmail = async (to: string, subject: string, body: string) => {
    try {
      console.log('Sending email to:', to, 'subject:', subject);
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        throw new Error('No active session');
      }
      
      const response = await fetch(
        `https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ to, subject, body })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      toast({
        title: "Email Sent",
        description: "Your email has been sent successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to Send Email",
        description: "There was an error sending your email. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return (
    <div className="space-y-4">
      <EmailComposeForm
        isVisible={showComposeForm}
        onSend={handleSendNewEmail}
        onCancel={() => setShowComposeForm(false)}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmailListPanel
          emails={emails}
          isLoading={isLoading}
          folder={folder}
          setFolder={setFolder}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
          processingEmailId={processingEmailId}
          refreshEmails={() => refreshEmails(folder)}
          onCompose={() => setShowComposeForm(true)}
        />
        <EmailDetailPanel
          selectedEmail={selectedEmail}
          onCreateBooking={handleCreateBooking}
          onSendReply={handleSendReply}
          processingEmailId={processingEmailId}
        />
      </div>
    </div>
  );
};

export default EmailInbox;
