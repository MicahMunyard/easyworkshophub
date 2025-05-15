
import React, { useState } from 'react';
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
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RotateCw, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailTestingProps {
  emailSubject?: string;
  emailContent?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSendTest: (recipients: string[], options: any) => Promise<{ success: boolean; message?: string }>;
  isSubmitting: boolean;
}

const EmailTesting: React.FC<EmailTestingProps> = ({ 
  emailSubject,
  emailContent,
  isOpen: propIsOpen, 
  onClose, 
  onSendTest,
  isSubmitting
}) => {
  const [isOpen, setIsOpen] = useState(propIsOpen || false);
  const [recipients, setRecipients] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string } | null>(null);
  const { toast } = useToast();

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
    resetForm();
  };

  const resetForm = () => {
    setRecipients("");
    setNote("");
    setError(null);
    setTestResult(null);
  };

  const validateForm = () => {
    if (!recipients.trim()) {
      setError("Please enter at least one email address");
      return false;
    }

    const emailList = recipients.split(',').map(email => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    for (const email of emailList) {
      if (!emailRegex.test(email)) {
        setError(`Invalid email address: ${email}`);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const handleSendTest = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setTestResult(null);
    
    try {
      const recipientsList = recipients.split(',').map(email => email.trim());
      const result = await onSendTest(recipientsList, {
        subject: emailSubject,
        content: emailContent,
        note: note.trim() || undefined
      });

      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Test email sent",
          description: "Your test email has been sent successfully",
        });
        
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to send test email"
      });
      
      toast({
        title: "Failed to send test",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={propIsOpen !== undefined ? propIsOpen : isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>
            Send a test email to verify your template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="recipients">Recipients</Label>
            <Input
              id="recipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="email@example.com, another@example.com"
              disabled={isLoading || isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter one or more email addresses, separated by commas
            </p>
          </div>

          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note to explain the purpose of this test..."
              rows={2}
              disabled={isLoading || isSubmitting}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading || isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendTest}
            disabled={isLoading || isSubmitting}
            className="gap-2"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <RotateCw className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailTesting;
