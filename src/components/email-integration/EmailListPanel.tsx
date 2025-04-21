
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle, AlertCircle, Mail } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { EmailType } from "@/types/email";

interface EmailListPanelProps {
  emails: EmailType[];
  isLoading: boolean;
  folder: "inbox" | "sent" | "junk";
  setFolder: (value: "inbox" | "sent" | "junk") => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedEmail: EmailType | null;
  setSelectedEmail: (email: EmailType) => void;
  processingEmailId: string | null;
  refreshEmails: () => void;
}

const FOLDERS = [
  { label: "Inbox", value: "inbox" },
  { label: "Sent", value: "sent" },
  { label: "Junk", value: "junk" }
];

const EmailListPanel: React.FC<EmailListPanelProps> = ({
  emails,
  isLoading,
  folder,
  setFolder,
  searchTerm,
  setSearchTerm,
  selectedEmail,
  setSelectedEmail,
  processingEmailId,
  refreshEmails,
}) => {
  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEmailStatusBadge = (email: EmailType) => {
    if (email.booking_created) {
      return (
        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" /> Booking Created
        </Badge>
      );
    }
    if (processingEmailId === email.id) {
      return (
        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
          <Loader2 className="h-3 w-3 animate-spin" /> Processing
        </Badge>
      );
    }
    if (email.processing_status === 'failed') {
      return (
        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> Failed
        </Badge>
      );
    }
    if (email.is_booking_email) {
      return (
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
          Potential Booking
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="md:col-span-1">
      <CardHeader className="px-4 py-3">
        <CardTitle className="text-sm font-medium">Inbox</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex items-center gap-2 px-4 py-2">
          <Select value={folder} onValueChange={v => setFolder(v as "inbox" | "sent" | "junk")}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Folder" />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map(f => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search emails..."
              className="pl-8 input input-bordered w-full"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="border rounded-md p-2 bg-background hover:bg-accent disabled:opacity-50"
            onClick={refreshEmails}
            disabled={isLoading}
            aria-label="Refresh"
            type="button"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading emails...</span>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No emails found
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 ${selectedEmail?.id === email.id ? 'bg-muted' : ''}`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-medium truncate">{email.from}</div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(email.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-sm font-medium mb-1 truncate">
                    {email.subject}
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {email.content.replace(/<[^>]*>/g, ' ')}
                  </div>
                  <div className="mt-2 flex gap-1">
                    {getEmailStatusBadge(email)}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailListPanel;
