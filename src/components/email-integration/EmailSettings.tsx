
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";
import EmailProviderButtons from "./settings/EmailProviderButtons";
import EmailCredentials from "./settings/EmailCredentials";
import AutoCreateToggle from "./settings/AutoCreateToggle";
import EmailSettingsActions from "./settings/EmailSettingsActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailSettingsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ 
  isConnected,
  onConnectionChange 
}) => {
  const { toast } = useToast();
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  
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
    lastError,
    connectEmail,
    disconnectEmail,
    updateSettings,
    diagnoseConnectionIssues
  } = useEmailConnection();

  const handleSelectProvider = (selectedProvider: "gmail" | "outlook" | "yahoo" | "other") => {
    setProvider(selectedProvider);
    
    // For OAuth providers, we can start the connection flow immediately
    if (selectedProvider === "gmail" || selectedProvider === "outlook") {
      connectEmail();
    }
  };

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
  
  const handleDiagnoseIssues = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    
    try {
      const result = await diagnoseConnectionIssues();
      setDiagnosticResult(result);
    } finally {
      setIsDiagnosing(false);
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
        {lastError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{lastError}</AlertDescription>
          </Alert>
        )}
        
        {diagnosticResult && (
          <Alert 
            variant={diagnosticResult.includes("fine") ? "default" : "destructive"} 
            className="mb-4"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Connection Diagnostic</AlertTitle>
            <AlertDescription>{diagnosticResult}</AlertDescription>
          </Alert>
        )}
        
        {!isConnected ? (
          <>
            <EmailProviderButtons 
              onSelectProvider={handleSelectProvider} 
              isLoading={isLoading} 
            />
            
            {(provider === "yahoo" || provider === "other") && (
              <EmailCredentials 
                emailAddress={emailAddress}
                setEmailAddress={setEmailAddress}
                password={password}
                setPassword={setPassword}
                isConnected={isConnected}
                isLoading={isLoading}
              />
            )}
          </>
        ) : (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Email Connected</p>
                <p className="text-sm text-green-600">{emailAddress} ({provider})</p>
              </div>
            </div>
            
            <AutoCreateToggle 
              autoCreateBookings={autoCreateBookings}
              setAutoCreateBookings={setAutoCreateBookings}
              disabled={!isConnected || isLoading}
            />
          </>
        )}
        
        {isConnected && (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDiagnoseIssues}
              disabled={isDiagnosing || isLoading}
              className="flex items-center gap-1"
            >
              {isDiagnosing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Diagnosing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Diagnose Connection Issues
                </>
              )}
            </Button>
          </div>
        )}
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
