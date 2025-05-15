
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CheckIcon, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { EmailTestingProps } from "./types";

const EmailTesting: React.FC<EmailTestingProps> = ({ 
  emailSubject,
  emailContent,
  onSendTest,
  isSubmitting 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipients, setRecipients] = useState("");
  const [note, setNote] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message?: string } | null>(null);
  const { toast } = useToast();

  const handleClose = () => {
    setIsOpen(false);
    setRecipients("");
    setNote("");
    setResult(null);
  };

  const handleSendTest = async () => {
    if (!recipients) {
      toast({
        title: "Missing recipient",
        description: "Please enter at least one email address",
        variant: "destructive",
      });
      return;
    }

    // Format comma-separated emails into array
    const recipientList = recipients.split(",").map(email => email.trim());

    setIsSending(true);
    setResult(null);

    try {
      const result = await onSendTest(recipientList, {
        subject: emailSubject,
        content: emailContent,
        note
      });

      setResult(result);

      if (result.success) {
        setTimeout(() => {
          handleClose();
          toast({
            title: "Test email sent",
            description: "Your test email has been sent successfully",
          });
        }, 2000);
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send test email",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm">
            Test Email
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>
              Send a test email to verify your template before using it in a campaign.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="recipients">Recipients</Label>
              <Input
                id="recipients"
                placeholder="email@example.com, email2@example.com"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple email addresses with commas
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                readOnly
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="note">Additional note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add a note to this test email..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSendTest}
              disabled={isSending || isSubmitting}
            >
              {isSending ? "Sending..." : "Send Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailTesting;
