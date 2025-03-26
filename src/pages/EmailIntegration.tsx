
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import EmailInbox from "@/components/email-integration/EmailInbox";
import EmailSettings from "@/components/email-integration/EmailSettings";
import EmailAutomation from "@/components/email-integration/EmailAutomation";

const EmailIntegration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (user) {
      checkEmailConnection();
    }
  }, [user]);

  const checkEmailConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error("Error checking email connection:", error);
        return;
      }
      
      setIsConnected(!!data);
    } catch (error) {
      console.error("Error checking email connection:", error);
    }
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
              setIsConnected(connected);
              if (connected) {
                toast({
                  title: "Email Connected",
                  description: "Your email account has been successfully connected."
                });
              }
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
