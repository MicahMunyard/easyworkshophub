import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Send, Bold, Italic, Underline, Paperclip } from "lucide-react";
import { EmailType } from "@/types/email";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useEmailSignatures } from "@/hooks/email/useEmailSignatures";

interface EmailReplyFormProps {
  email: EmailType;
  onSendReply: (content: string) => Promise<boolean>;
  onCancel: () => void;
}

interface Template {
  id: string;
  name: string;
  body: string;
}

const EmailReplyForm: React.FC<EmailReplyFormProps> = ({ 
  email, 
  onSendReply,
  onCancel 
}) => {
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [includeSignature, setIncludeSignature] = useState(true);
  const { signatures, defaultSignature } = useEmailSignatures();
  const [templates, setTemplates] = useState<Template[]>([
    // Default templates
    {
      id: "template-1",
      name: "Quick Confirmation",
      body: `Hi ${email.from},\n\nThank you for your message. We've received your request and will process it shortly.\n\nBest regards,\nWorkshop Team`
    },
    {
      id: "template-2",
      name: "Booking Confirmation",
      body: `Hi ${email.from},\n\nWe've confirmed your booking request and added it to our schedule.\n\nPlease let us know if you need to make any changes.\n\nThanks,\nWorkshop Team`
    }
  ]);

  // Set default signature on mount
  useEffect(() => {
    if (defaultSignature && !selectedSignatureId) {
      setSelectedSignatureId(defaultSignature.id);
    }
  }, [defaultSignature]);

  const handleFormatText = (format: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = replyContent.substring(start, end);
    let formattedText = '';

    switch (format) {
      case 'bold':
        formattedText = `<strong>${selectedText}</strong>`;
        break;
      case 'italic':
        formattedText = `<em>${selectedText}</em>`;
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`;
        break;
      default:
        return;
    }

    const newContent = replyContent.substring(0, start) + formattedText + replyContent.substring(end);
    setReplyContent(newContent);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setReplyContent(template.body);
      }
    }
  }, [selectedTemplate, templates]);

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;
    
    setIsSending(true);
    try {
      let finalContent = replyContent;
      
      // Append signature if enabled
      if (includeSignature) {
        const signatureToUse = signatures.find(s => s.id === selectedSignatureId) || defaultSignature;
        if (signatureToUse) {
          finalContent = `${replyContent}\n\n<div style="border-top: 1px solid #e5e7eb; margin-top: 16px; padding-top: 16px;">${signatureToUse.html_content}</div>`;
        }
      }
      
      const success = await onSendReply(finalContent);
      if (success) {
        onCancel();
      }
    } finally {
      setIsSending(false);
    }
  };

  // Format the recipient info
  const recipientInfo = `${email.from} <${email.sender_email}>`;

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Reply to Email</h3>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="no-template">No template</SelectItem>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="recipient">To</Label>
          <span className="text-sm text-muted-foreground">{recipientInfo}</span>
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="subject">Subject</Label>
          <span className="text-sm text-muted-foreground">Re: {email.subject}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <ToggleGroup type="multiple" className="justify-start">
            <ToggleGroupItem value="bold" onClick={() => handleFormatText('bold')}>
              <Bold className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" onClick={() => handleFormatText('italic')}>
              <Italic className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" onClick={() => handleFormatText('underline')}>
              <Underline className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <div className="ml-auto">
            <input
              type="file"
              id="file-upload"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button variant="outline" size="icon" className="cursor-pointer" type="button" asChild>
                <span>
                  <Paperclip className="h-4 w-4" />
                </span>
              </Button>
            </label>
          </div>
        </div>

        <Label htmlFor="reply-content">Message</Label>
        <Textarea
          id="reply-content"
          placeholder="Type your reply here..."
          className="min-h-[200px]"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />

        {attachments.length > 0 && (
          <div className="mt-2">
            <Label>Attachments:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 bg-secondary p-2 rounded">
                  <span className="text-sm">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveAttachment(index)}
                    className="h-auto p-1"
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
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
          onClick={handleSendReply}
          disabled={isSending || !replyContent.trim()}
          className="gap-1"
        >
          {isSending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" /> Send Reply
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailReplyForm;
