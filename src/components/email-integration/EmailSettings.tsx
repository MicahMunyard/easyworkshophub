
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Mail, Trash2, AlertCircle } from "lucide-react";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";

interface EmailSettingsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const EmailSettingsProps: React.FC<EmailSettingsProps> = ({ 
  isConnected,
  onConnectionChange 
}) => {
  const { toast } = useToast();
  const {
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    provider,
    setProvider,
    autoCreateBookings,
    setAutoCreateBookings,
    isLoading,
    connectEmail,
    disconnectEmail
  } = useEmailConnection();

  const handleConnectEmail = async () => {
    const success = await connectEmail();
    if (success) {
      onConnectionChange(true);
    }
  };

  const handleDisconnectEmail = async () => {
    const success = await disconnectEmail();
    if (success) {
      onConnectionChange(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Connection Settings</CardTitle>
        <CardDescription>
          Connect your email account to receive and manage booking requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email-provider">Email Provider</Label>
          <select
            id="email-provider"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            disabled={isConnected || isLoading}
          >
            <option value="gmail">Gmail</option>
            <option value="outlook">Outlook</option>
            <option value="yahoo">Yahoo Mail</option>
            <option value="other">Other (IMAP)</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email-address">Email Address</Label>
          <Input
            id="email-address"
            type="email"
            placeholder="your.email@example.com"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            disabled={isConnected || isLoading}
          />
        </div>
        
        {!isConnected && (
          <div className="space-y-2">
            <Label htmlFor="email-password">Password or App Password</Label>
            <Input
              id="email-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              <AlertCircle className="inline-block h-3 w-3 mr-1" />
              For Gmail and other providers, you may need to use an App Password
            </p>
          </div>
        )}
        
        <div className="flex items-center justify-between space-y-0 pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-create">Automatic Booking Creation</Label>
            <p className="text-xs text-muted-foreground">
              Automatically create bookings from emails when possible
            </p>
          </div>
          <Switch
            id="auto-create"
            checked={autoCreateBookings}
            onCheckedChange={setAutoCreateBookings}
            disabled={!isConnected || isLoading}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isConnected ? (
          <>
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleDisconnectEmail}
              disabled={isLoading}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" /> Disconnect Account
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                // Save settings if already connected
                toast({
                  title: "Settings Saved",
                  description: "Your email settings have been updated"
                });
              }}
              disabled={isLoading}
            >
              Save Settings
            </Button>
          </>
        ) : (
          <>
            <div></div> {/* Empty div for spacing */}
            <Button 
              type="button" 
              onClick={handleConnectEmail}
              disabled={isLoading}
              className="gap-1"
            >
              {isLoading ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full inline-block animate-spin mr-1"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4" /> Connect Account
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default EmailSettingsProps;
