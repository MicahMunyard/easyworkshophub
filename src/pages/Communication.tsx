
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import CommunicationInbox from "@/components/communication/CommunicationInbox";
import SocialConnections from "@/components/communication/SocialConnections";
import { useCommunicationState } from "@/hooks/communication/useCommunicationState";

const Communication = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("inbox");
  const communicationState = useCommunicationState();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communication</h1>
        <p className="text-muted-foreground">
          Manage conversations from your social media channels
        </p>
      </div>

      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="inbox">Inbox</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="space-y-4">
          <CommunicationInbox {...communicationState} />
        </TabsContent>
        
        <TabsContent value="connections">
          <SocialConnections />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Communication;
