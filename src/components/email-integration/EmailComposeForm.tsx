import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEmailSignatures } from "@/hooks/email/useEmailSignatures";

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
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const { toast } = useToast();
  const { signatures, defaultSignature } = useEmailSignatures();

  // Set default signature on mount
  useEffect(() => {
    if (defaultSignature && !selectedSignatureId) {
      setSelectedSignatureId(defaultSignature.id);
    }
  }, [defaultSignature]);

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
      let finalBody = body;
      
      // Append signature if enabled
      if (includeSignature) {
        const signatureToUse = signatures.find(s => s.id === selectedSignatureId) || defaultSignature;
        if (signatureToUse) {
          finalBody = `${body}\n\n<div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px;">${signatureToUse.html_content}</div>`;
        }
      }
      
      const success = await onSend(to, subject, finalBody);
      
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

        <div className="space-y-4 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="include-signature"
                checked={includeSignature}
                onCheckedChange={setIncludeSignature}
              />
              <Label htmlFor="include-signature">Include signature</Label>
            </div>
            {includeSignature && signatures.length > 0 && (
              <Select value={selectedSignatureId} onValueChange={setSelectedSignatureId}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select signature" />
                </SelectTrigger>
                <SelectContent>
                  {signatures.map((sig) => (
                    <SelectItem key={sig.id} value={sig.id}>
                      {sig.name} {sig.is_default ? "(Default)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
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