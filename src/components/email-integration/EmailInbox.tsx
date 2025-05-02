
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import { EmailType } from "@/types/email";
import EmailListPanel from "./EmailListPanel";
import EmailDetailPanel from "./EmailDetailPanel";

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

  return (
    <div className="space-y-4">
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
