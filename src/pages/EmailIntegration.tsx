
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import EmailInbox from "@/components/email-integration/EmailInbox";
import EmailSettings from "@/components/email-integration/EmailSettings";
import EmailAutomation from "@/components/email-integration/EmailAutomation";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";

const EmailIntegration = () => {
  const { user } = useAuth();
  const { isConnected, checkConnection } = useEmailConnection();
  const [activeTab, setActiveTab] = useState("inbox");
  
  useEffect(() => {
    if (user) {
      checkConnection();
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Email Integration</h1>
        <p className="text-muted-foreground">
          Connect your email account to automatically create bookings from customer emails
        </p>
      </div>

      <Tabs 
        defaultValue={activeTab} 
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
            <EmailInbox />
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
              // This will be updated by the hook itself
              // We just need to refresh the UI
              checkConnection();
            }} 
          />
        </TabsContent>
        
        <TabsContent value="automation">
          <EmailAutomation isConnected={isConnected} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailIntegration;
