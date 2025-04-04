
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";
import EmailProviderSelector from "./settings/EmailProviderSelector";
import EmailCredentials from "./settings/EmailCredentials";
import AutoCreateToggle from "./settings/AutoCreateToggle";
import EmailSettingsActions from "./settings/EmailSettingsActions";

interface EmailSettingsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ 
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
    disconnectEmail,
    updateSettings
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

  const handleSaveSettings = async () => {
    const success = await updateSettings();
    if (success) {
      toast({
        title: "Settings Saved",
        description: "Your email settings have been updated"
      });
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
        <EmailProviderSelector 
          provider={provider} 
          setProvider={setProvider} 
          disabled={isConnected || isLoading} 
        />
        
        <EmailCredentials 
          emailAddress={emailAddress}
          setEmailAddress={setEmailAddress}
          password={password}
          setPassword={setPassword}
          isConnected={isConnected}
          isLoading={isLoading}
        />
        
        <AutoCreateToggle 
          autoCreateBookings={autoCreateBookings}
          setAutoCreateBookings={setAutoCreateBookings}
          disabled={!isConnected || isLoading}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <EmailSettingsActions 
          isConnected={isConnected}
          isLoading={isLoading}
          onConnect={handleConnectEmail}
          onDisconnect={handleDisconnectEmail}
          onSaveSettings={handleSaveSettings}
        />
      </CardFooter>
    </Card>
  );
};

export default EmailSettings;
