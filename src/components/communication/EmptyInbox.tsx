
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, MessageSquare, RefreshCcw } from "lucide-react";
import FacebookIntegration from "./FacebookIntegration";

interface EmptyInboxProps {
  hasFacebookConnection?: boolean;
  onRefresh?: () => void;
}

const EmptyInbox: React.FC<EmptyInboxProps> = ({ 
  hasFacebookConnection = false,
  onRefresh
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
          <div className="flex flex-wrap gap-3 justify-center">
            <FacebookIntegration />
            
            <Button variant="outline" className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              Connect Instagram
            </Button>
            
            <Button variant="outline" className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                <path d="M10.97 2.29a4.5 4.5 0 0 1-.88 1.74c-.14.2-.5.3-.5.3v1.73c.26 0 .94-.39.94-.39v4.33a3.5 3.5 0 0 1-6.07 2.4 3.5 3.5 0 0 1 5.1-4.78V4.96A6.04 6.04 0 0 0 12 6.45V3.62c-.22-.14-.7-.5-.7-.5a3.45 3.45 0 0 0 1.36-2.15h-2.26a11.72 11.72 0 0 1 .57 1.32Z" fill="#FF004F"/>
              </svg>
              Connect TikTok
            </Button>
            
            {hasFacebookConnection && (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyInbox;
