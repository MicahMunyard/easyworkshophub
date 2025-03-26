
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Search, RefreshCw, Clock } from "lucide-react";
import { useEmailIntegration } from "@/hooks/email/useEmailIntegration";
import EmailMessage from "./EmailMessage";
import { EmailType } from "@/types/email";

const EmailInbox = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    emails, 
    isLoading, 
    selectedEmail,
    setSelectedEmail,
    refreshEmails, 
    createBookingFromEmail 
  } = useEmailIntegration();
  const [searchTerm, setSearchTerm] = useState("");
  
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
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search emails..."
            className="pl-8"
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
                <Clock className="mr-2 h-4 w-4 animate-spin" />
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
                        <div className="text-xs text-muted-foreground">
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
                        {email.booking_created ? (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Booking Created
                          </Badge>
                        ) : email.is_booking_email ? (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            Potential Booking
                          </Badge>
                        ) : null}
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
              bookingCreated={selectedEmail.booking_created}
              isPotentialBooking={selectedEmail.is_booking_email}
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
