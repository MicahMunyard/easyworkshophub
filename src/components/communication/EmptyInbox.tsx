
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageSquare, RefreshCcw } from "lucide-react";
import FacebookIntegration from "./FacebookIntegration";

interface EmptyInboxProps {
  hasFacebookConnection?: boolean;
  onRefresh?: () => void;
  onSwitchToConnections?: () => void;
}

const EmptyInbox: React.FC<EmptyInboxProps> = ({ 
  hasFacebookConnection = false,
  onRefresh,
  onSwitchToConnections
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Social Inbox</CardTitle>
        <CardDescription>
          {hasFacebookConnection 
            ? "Your inbox is ready to receive messages from your connected accounts" 
            : "Connect your social media accounts to start managing conversations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10 space-y-6">
        <div className="flex gap-4">
          <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
        </div>
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-2">
            {hasFacebookConnection 
              ? "No conversations found" 
              : "No conversations yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {hasFacebookConnection 
              ? "You're connected, but we don't see any conversations yet. They should appear here when customers message you." 
              : "Connect your social media accounts to start managing your conversations in one place."}
          </p>
          {!hasFacebookConnection ? (
            <Button 
              size="lg" 
              onClick={onSwitchToConnections}
            >
              Connect Social Accounts
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onRefresh}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh Inbox
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyInbox;
