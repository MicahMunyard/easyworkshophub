import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import type { EmailTestingProps } from "./types";

interface TestEmailFormValues {
  recipients: string;
  note?: string;
}

const EmailTesting: React.FC<EmailTestingProps> = ({ 
  emailSubject, 
  emailContent, 
  onSendTest, 
  isSubmitting 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const { toast } = useToast();
  const [formValues, setFormValues] = useState<TestEmailFormValues>({
    recipients: "",
    note: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendTest = async () => {
    if (!formValues.recipients) {
      toast({
        title: "Error",
        description: "Please enter at least one recipient email address.",
        variant: "destructive",
      });
      return;
    }

    const recipients = formValues.recipients.split(",").map(email => email.trim());

    if (onSendTest) {
      const result = await onSendTest(recipients, { note: formValues.note });
      if (result.success) {
        setIsOpen(false);
      }
    } else {
      toast({
        title: "Error",
        description: "Test email functionality is not available.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Test Email</DialogTitle>
          <DialogDescription>
            Send a test email to ensure your template looks great.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              type="email"
              id="recipients"
              name="recipients"
              placeholder="Enter recipient email addresses, separated by commas"
              value={formValues.recipients}
              onChange={handleInputChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="note">Additional Note (Optional)</Label>
            <Textarea
              id="note"
              name="note"
              placeholder="Add a note to the test email"
              value={formValues.note}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSendTest} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Test Email"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTesting;
