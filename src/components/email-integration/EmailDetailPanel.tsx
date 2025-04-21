
import React from "react";
import { Card } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { EmailType } from "@/types/email";
import EmailMessage from "./EmailMessage";

interface EmailDetailPanelProps {
  selectedEmail: EmailType | null;
  onCreateBooking: (email: EmailType) => Promise<boolean>;
  onSendReply: (content: string) => Promise<boolean>;
  processingEmailId: string | null;
}

const EmailDetailPanel: React.FC<EmailDetailPanelProps> = ({
  selectedEmail,
  onCreateBooking,
  onSendReply,
  processingEmailId,
}) => {
  return (
    <Card className="md:col-span-2">
      {selectedEmail ? (
        <EmailMessage
          email={selectedEmail}
          onCreateBooking={() => onCreateBooking(selectedEmail)}
          onReply={onSendReply}
          bookingCreated={selectedEmail.booking_created}
          isPotentialBooking={selectedEmail.is_booking_email}
          isProcessing={processingEmailId === selectedEmail.id}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
          <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>Select an email to view its contents</p>
        </div>
      )}
    </Card>
  );
};

export default EmailDetailPanel;
