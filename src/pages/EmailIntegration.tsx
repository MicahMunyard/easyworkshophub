
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import EmailInbox from "@/components/email-integration/EmailInbox";
import EmailSettings from "@/components/email-integration/EmailSettings";
import EmailAutomation from "@/components/email-integration/EmailAutomation";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";
import { useEmailFetch } from "@/hooks/email/useEmailFetch";
import NewBookingModal from "@/components/NewBookingModal";
import { BookingType } from "@/types/booking";
import { EmailType } from "@/types/email";
import { useEmailBookingModal } from "@/hooks/email/useEmailBookingModal";
import { useToast } from "@/hooks/use-toast";
import { useBookings } from "@/hooks/useBookings";

const EmailIntegration = () => {
  const { user } = useAuth();
  const { isConnected, checkConnection, connectionStatus } = useEmailConnection();
  const [activeTab, setActiveTab] = useState("inbox");
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const { fetchEmailsByFolder } = useEmailFetch();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<EmailType | null>(null);
  const [bookingInitialData, setBookingInitialData] = useState<Partial<BookingType> | undefined>(undefined);
  const { prepareBookingDataFromEmail, markEmailAsProcessed } = useEmailBookingModal();
  const { toast } = useToast();
  const { addBooking } = useBookings();
  
  // Check connection when component mounts
  useEffect(() => {
    if (user) {
      setIsCheckingConnection(true);
      checkConnection().finally(() => {
        setIsCheckingConnection(false);
      });
    }
  }, [user, checkConnection]);

  // Go to settings tab if not connected
  useEffect(() => {
    if (!isCheckingConnection && !isConnected) {
      setActiveTab("settings");
    }
  }, [isConnected, isCheckingConnection]);

  const handleOpenBookingModal = (email: EmailType) => {
    setSelectedEmail(email);
    const initialData = prepareBookingDataFromEmail(email);
    setBookingInitialData(initialData);
    setIsBookingModalOpen(true);
  };

  const handleSaveBooking = async (booking: BookingType) => {
    if (!selectedEmail) return;

    try {
      // Save booking to database
      const success = await addBooking(booking);
      
      if (!success) {
        throw new Error("Failed to create booking");
      }
      
      // Mark email as processed
      await markEmailAsProcessed(selectedEmail.id, booking.id);
      
      toast({
        title: "Success",
        description: "Booking created successfully from email"
      });
      
      setIsBookingModalOpen(false);
      setSelectedEmail(null);
      setBookingInitialData(undefined);
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create booking. Please try again."
      });
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedEmail(null);
    setBookingInitialData(undefined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Integration</h1>
        <p className="text-muted-foreground">
          Connect your email account to automatically create bookings from customer emails
        </p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="space-y-4">
          {isConnected ? (
            <EmailInbox onOpenBookingModal={handleOpenBookingModal} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Connect Your Email</CardTitle>
                <CardDescription>
                  You need to connect an email account to view your inbox
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => setActiveTab("settings")}>
                  Connect Email Account
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="settings">
          <EmailSettings 
            isConnected={isConnected} 
            onConnectionChange={(connected) => {
              // Refresh connection status
              checkConnection();
            }} 
          />
        </TabsContent>
        
        <TabsContent value="automation">
          <EmailAutomation isConnected={isConnected} />
        </TabsContent>
      </Tabs>

      <NewBookingModal
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onSave={handleSaveBooking}
        initialData={bookingInitialData}
        emailId={selectedEmail?.id}
      />
    </div>
  );
};

export default EmailIntegration;
