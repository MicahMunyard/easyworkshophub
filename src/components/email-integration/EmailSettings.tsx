
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Mail, Trash2, AlertCircle } from "lucide-react";

interface EmailSettingsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const EmailSettingsProps: React.FC<EmailSettingsProps> = ({ 
  isConnected,
  onConnectionChange 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [provider, setProvider] = useState("gmail");
  const [autoCreateBookings, setAutoCreateBookings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (user && isConnected) {
      fetchEmailSettings();
    }
  }, [user, isConnected]);

  const fetchEmailSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('email_address, provider, auto_create_bookings')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error("Error fetching email settings:", error);
        return;
      }
      
      if (data) {
        setEmailAddress(data.email_address);
        setProvider(data.provider);
        setAutoCreateBookings(data.auto_create_bookings);
      }
    } catch (error) {
      console.error("Error fetching email settings:", error);
    }
  };

  const handleConnectEmail = async () => {
    if (!emailAddress || !password) {
      toast({
        title: "Missing Information",
        description: "Please provide email address and password",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Note: In a real implementation, we'd use OAuth or a secure way to handle email credentials
      // This is just a mockup of what the UX would look like
      
      // Simulating connection process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const { error } = await supabase
        .from('email_connections')
        .upsert({
          user_id: user?.id,
          email_address: emailAddress,
          provider: provider,
          auto_create_bookings: autoCreateBookings,
          connected_at: new Date().toISOString()
        });
      
      if (error) {
        throw error;
      }
      
      setPassword(""); // Clear password for security
      onConnectionChange(true);
      
    } catch (error) {
      console.error("Error connecting email:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to email account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectEmail = async () => {
    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('email_connections')
        .delete()
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      setEmailAddress("");
      setPassword("");
      setProvider("gmail");
      setAutoCreateBookings(false);
      onConnectionChange(false);
      
      toast({
        title: "Email Disconnected",
        description: "Your email account has been disconnected"
      });
      
    } catch (error) {
      console.error("Error disconnecting email:", error);
      toast({
        title: "Error",
        description: "Failed to disconnect email account",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
                // This would update settings without reconnecting
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
