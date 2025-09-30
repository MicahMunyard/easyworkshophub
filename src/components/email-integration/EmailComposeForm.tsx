import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailComposeFormProps {
  onSend: (to: string, subject: string, body: string) => Promise<boolean>;
  onCancel: () => void;
  isVisible: boolean;
}

const EmailComposeForm: React.FC<EmailComposeFormProps> = ({
  onSend,
  onCancel,
  isVisible
}) => {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!to.trim() || !subject.trim() || !body.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const success = await onSend(to, subject, body);
      
      if (success) {
        toast({
          title: "Email Sent",
          description: "Your email has been sent successfully.",
        });
        
        // Reset form
        setTo("");
        setSubject("");
        setBody("");
        onCancel();
      } else {
        toast({
          title: "Failed to Send",
          description: "There was an error sending your email. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Compose Email</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          disabled={isSending}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            type="email"
            placeholder="recipient@example.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            placeholder="Email subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isSending}
          />
        </div>
        
        <div>
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            placeholder="Type your message here..."
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            disabled={isSending}
            className="resize-none"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={isSending}
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailComposeForm;