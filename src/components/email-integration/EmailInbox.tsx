import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle, Loader2, Mail, RefreshCw, Search } from "lucide-react";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import EmailMessage from "./EmailMessage";
import { EmailType } from "@/types/email";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const FOLDERS = [
  { label: "Inbox", value: "inbox" },
  { label: "Sent", value: "sent" },
  { label: "Junk", value: "junk" }
];

const EmailInbox = () => {
  const { toast } = useToast();
  const { 
    emails, 
    isLoading, 
    selectedEmail,
    setSelectedEmail,
    processingEmailId,
    refreshEmails, 
    createBookingFromEmail,
    replyToEmail,
    fetchEmailsByFolder
  } = useEmailIntegration();
  const [folder, setFolder] = useState<"inbox" | "sent" | "junk">("inbox");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmailsByFolder(folder);
  }, [folder, fetchEmailsByFolder]);

  const filteredEmails = emails.filter(email => 
    email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateBooking = async (email: EmailType) => {
    const success = await createBookingFromEmail(email);
    if (success) {
      toast({
        title: "Booking Created",
        description: "A new booking has been created from this email."
      });
    }
    return success;
  };
  
  const handleSendReply = async (content: string) => {
    if (!selectedEmail) return false;
    
    const success = await replyToEmail(selectedEmail, content);
    return success;
  };
  
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
  
  const handleFolderChange = (value: string) => {
    if (value === "inbox" || value === "sent" || value === "junk") {
      setFolder(value);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Select value={folder} onValueChange={handleFolderChange}>
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={refreshEmails}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-1">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
                      className={`p-3 cursor-pointer hover:bg-muted/50 ${
                        selectedEmail?.id === email.id ? 'bg-muted' : ''
                      }`}
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
        
        <Card className="md:col-span-2">
          {selectedEmail ? (
            <EmailMessage 
              email={selectedEmail} 
              onCreateBooking={() => handleCreateBooking(selectedEmail)}
              onReply={handleSendReply}
              bookingCreated={selectedEmail.booking_created}
              isPotentialBooking={selectedEmail.is_booking_email}
              isProcessing={processingEmailId === selectedEmail.id}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-muted-foreground">
              <Mail className="h-12 w-12 mb-4 text-muted-foreground/50" />
              <p>Select an email to view its contents</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EmailInbox;
