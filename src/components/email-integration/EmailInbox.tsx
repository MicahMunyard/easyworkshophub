
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import { EmailType } from "@/types/email";
import EmailListPanel from "./EmailListPanel";
import EmailDetailPanel from "./EmailDetailPanel";
import EmailComposeForm from "./EmailComposeForm";

const EmailInbox = () => {
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
    refreshEmails();
  }, [folder, refreshEmails]);

  const handleCreateBooking = async (email: EmailType) => {
    const success = await createBookingFromEmail(email);
    if (success) {
      toast({
        title: "Booking Created",
        description: "A new booking has been created from this email.",
      });
    }
    return success;
  };

  const handleSendReply = async (content: string) => {
    if (!selectedEmail) return false;
    return await replyToEmail(selectedEmail, content);
  };

  const handleSendNewEmail = async (to: string, subject: string, body: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const response = await supabase.functions.invoke('email-integration/send', {
        body: { to, subject, body }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send email');
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
          refreshEmails={refreshEmails}
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
