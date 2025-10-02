
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram, RefreshCcw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { connectSocialPlatform } from "@/hooks/communication/api/connectSocialPlatform";
import FacebookIntegration from "./FacebookIntegration";
import FacebookWebhookSetup from "./FacebookWebhookSetup";

const SocialConnections: React.FC = () => {
  const { user } = useAuth();
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  const handleConnectPlatform = async (platform: 'facebook' | 'instagram' | 'tiktok') => {
    if (!user) return;
    
    setIsConnecting(platform);
    
    try {
      await connectSocialPlatform(user.id, platform);
    } finally {
      setIsConnecting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connected Accounts</CardTitle>
          <CardDescription>
            Manage your connected social media accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Facebook className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="font-medium">Facebook Page</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage conversations from your Facebook page
                  </p>
                </div>
              </div>
              <FacebookIntegration />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Instagram className="h-6 w-6 text-pink-600" />
                <div>
                  <h4 className="font-medium">Instagram</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage conversations from Instagram direct messages
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                disabled={isConnecting === 'instagram'}
                onClick={() => handleConnectPlatform('instagram')}
              >
                {isConnecting === 'instagram' ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.45 3.44a6.76 6.76 0 0 1-1.32 2.6c-.2.31-.75.45-.75.45v2.6c.4 0 1.4-.58 1.4-.58v6.5a5.25 5.25 0 0 1-9.1 3.61 5.25 5.25 0 0 1 7.65-7.16V7.45a9.06 9.06 0 0 0 2.48 2.22V5.44a5.22 5.22 0 0 1-1.06-.77 5.18 5.18 0 0 0 2.05-3.23h-3.39a17.6 17.6 0 0 1 .85 1.98Z" fill="#FF004F"/>
                </svg>
                <div>
                  <h4 className="font-medium">TikTok</h4>
                  <p className="text-sm text-muted-foreground">
                    Connect to manage conversations from TikTok messages
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                disabled={isConnecting === 'tiktok'}
                onClick={() => handleConnectPlatform('tiktok')}
              >
                {isConnecting === 'tiktok' ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connected Pages</CardTitle>
          <CardDescription>
            Manage your connected Facebook and Instagram pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No pages connected yet</p>
            <p className="text-sm text-muted-foreground mt-2">Connect your social media accounts above to see your pages here</p>
          </div>
        </CardContent>
      </Card>
      
      <FacebookWebhookSetup />
    </div>
  );
};

export default SocialConnections;
