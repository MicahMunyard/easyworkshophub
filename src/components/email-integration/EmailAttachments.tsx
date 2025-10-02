import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, File, Image, Video, FileSpreadsheet } from "lucide-react";
import { EmailAttachment } from "@/types/email";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailAttachmentsProps {
  attachments: EmailAttachment[];
  messageId: string;
}

const EmailAttachments: React.FC<EmailAttachmentsProps> = ({ attachments, messageId }) => {
  const { toast } = useToast();

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (mimeType.includes('pdf')) return <FileText className="h-4 w-4" />;
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return <FileSpreadsheet className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = async (attachment: EmailAttachment) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `https://qyjjbpyqxwrluhymvshn.supabase.co/functions/v1/email-integration/attachment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({
            messageId: attachment.messageId,
            attachmentId: attachment.attachmentId
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download attachment');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download Started",
        description: `Downloading ${attachment.filename}`,
      });
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the attachment. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-medium mb-2">Attachments ({attachments.length})</h4>
      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 border rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {getFileIcon(attachment.mimeType)}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{attachment.filename}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(attachment.size)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment)}
              className="ml-2"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmailAttachments;
