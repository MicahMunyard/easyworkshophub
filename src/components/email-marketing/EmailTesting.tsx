
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendHorizonal, LoaderCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailTestingProps {
  isOpen?: boolean;
  onClose?: () => void;
  emailSubject: string;
  emailContent: string;
  onSendTest: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
}

const EmailTesting: React.FC<EmailTestingProps> = ({
  isOpen = false,
  onClose,
  emailSubject,
  emailContent,
  onSendTest,
  isSubmitting
}) => {
  const [showDialog, setShowDialog] = useState(isOpen);
  const [recipients, setRecipients] = useState("");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setShowDialog(false);
    }
  };

  const handleSend = async () => {
    if (!recipients.trim()) {
      toast({
        title: "Error",
        description: "Please enter at least one recipient email address",
        variant: "destructive"
      });
      return;
    }

    const emailList = recipients
      .split(",")
      .map(email => email.trim())
      .filter(email => email);

    if (emailList.length === 0) {
      toast({
        title: "Error",
        description: "Please enter valid email addresses",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      const result = await onSendTest(emailList, {
        subject: emailSubject,
        content: emailContent,
        note: note
      });

      if (result.success) {
        toast({
          title: "Test email sent",
          description: `Email sent successfully to ${emailList.join(", ")}`,
        });
        handleClose();
      } else {
        toast({
          title: "Failed to send test email",
          description: result.message || "An error occurred while sending the test email",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while sending the test email",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen || showDialog} onOpenChange={(open) => {
      if (!open) handleClose();
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-3">
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              id="recipients"
              placeholder="email@example.com, email2@example.com"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Separate multiple email addresses with commas
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={emailSubject}
              disabled
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a note to include in the test email"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSending || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending || isSubmitting}
            className="gap-2"
          >
            {(isSending || isSubmitting) ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <SendHorizonal className="h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTesting;
