import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, SendIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailMarketing } from "./useEmailMarketing";

interface TestEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateId?: string;
  campaignSubject?: string;
  campaignName?: string;
}

export const TestEmailModal: React.FC<TestEmailModalProps> = ({
  isOpen,
  onClose,
  templateId,
  campaignSubject,
  campaignName,
}) => {
  const [recipient, setRecipient] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { templates, sendTestEmail } = useEmailMarketing();
  
  const selectedTemplate = templateId ? templates.find(t => t.id === templateId) : null;

  const handleSendTest = async () => {
    if (!recipient) {
      toast({
        title: "Email required",
        description: "Please enter a recipient email address",
        variant: "destructive"
      });
      return;
    }

    if (!selectedTemplate && !campaignSubject) {
      toast({
        title: "No content",
        description: "No template or campaign content found to send",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      // Use either the template content or a simple placeholder
      const content = selectedTemplate?.content || "<p>This is test content for your campaign.</p>";
      const subject = campaignSubject || selectedTemplate?.subject || "Test Email";
      
      const result = await sendTestEmail([recipient], {
        subject,
        content,
        note: `Test for ${campaignName || selectedTemplate?.name || "email campaign"}`
      });
      
      if (result.success) {
        toast({
          title: "Test sent",
          description: `Test email sent to ${recipient}`,
        });
        onClose();
      } else {
        toast({
          title: "Failed to send",
          description: result.message || "There was an error sending the test email",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email to preview how your email will look in recipients' inboxes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input
              id="recipient"
              placeholder="your@email.com"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          {!selectedTemplate && !campaignSubject && (
            <div className="flex items-center space-x-2 text-amber-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>No template or campaign selected. Please select one first.</span>
            </div>
          )}

          {(selectedTemplate || campaignSubject) && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium">You will send:</p>
              <p><span className="font-medium">Subject:</span> {campaignSubject || selectedTemplate?.subject}</p>
              <p><span className="font-medium">From:</span> Your configured sender email</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSending}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleSendTest} 
            disabled={!recipient || isSending || (!selectedTemplate && !campaignSubject)}
            className="flex items-center gap-2"
          >
            {isSending ? (
              <>Sending...</>
            ) : (
              <>
                <SendIcon className="h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
