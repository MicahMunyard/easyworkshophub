
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEmailConnection } from "@/hooks/email/useEmailConnection";
import { Loader2, Mail, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import EmailSignatureSettings from "./EmailSignatureSettings";

interface EmailSettingsProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

const EmailSettings: React.FC<EmailSettingsProps> = ({ 
  isConnected, 
  onConnectionChange 
}) => {
  const {
    provider,
    setProvider,
    emailAddress,
    setEmailAddress,
    password,
    setPassword,
    customHost,
    setCustomHost,
    customPort,
    setCustomPort,
    connectionStatus,
    isLoading,
    lastError,
    autoCreateBookings,
    setAutoCreateBookings,
    connectEmail,
    disconnectEmail,
    checkConnection,
    updateSettings,
    diagnoseConnectionIssues
  } = useEmailConnection();
  
  const [diagnosticMessage, setDiagnosticMessage] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleConnect = async () => {
    const success = await connectEmail();
    if (success) {
      onConnectionChange(true);
    }
  };

  const handleDisconnect = async () => {
    const success = await disconnectEmail();
    if (success) {
      onConnectionChange(false);
    }
  };

  const handleDiagnose = async () => {
    setIsDiagnosing(true);
    try {
      const message = await diagnoseConnectionIssues();
      setDiagnosticMessage(message);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleUpdateSettings = async () => {
    await updateSettings();
  };

  const getProviderLabel = (providerType: string) => {
    switch (providerType) {
      case 'gmail': return 'Google Gmail';
      case 'outlook': return 'Microsoft Outlook';
      case 'yahoo': return 'Yahoo Mail';
      case 'other': return 'Other Provider';
      default: return 'Unknown Provider';
    }
  };

  const getProviderDescription = (providerType: string) => {
    switch (providerType) {
      case 'gmail': 
        return 'Connect with your Google Gmail account using secure OAuth';
      case 'outlook': 
        return 'Connect with your Microsoft Outlook or Office 365 account using secure OAuth';
      case 'yahoo': 
        return 'Connect with your Yahoo Mail account';
      case 'other': 
        return 'Connect to any other provider using IMAP credentials';
      default: 
        return '';
    }
  };

  const getProviderIcon = (providerType: string) => {
    switch (providerType) {
      case 'gmail':
        return <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 5.457v13.086c0 .808-.65 1.457-1.457 1.457h-1.524v-9.414l-8.019 5.48-8.019-5.48v9.414H3.457A1.455 1.455 0 0 1 2 18.543V5.457c0-.486.23-.935.621-1.213.39-.278.890-.339 1.327-.157L12 9.716l8.051-5.629c.438-.182.937-.121 1.328.157.391.278.621.727.621 1.213z" fill="#EA4335"/>
        </svg>;
      case 'outlook':
        return <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 6.3c0 .9-.6 1.7-1.5 2.1L14 13.1V24h-4v-6.8c0-1.1.7-2.1 1.8-2.4l10.7-3.2c.9-.3 1.5-1.1 1.5-2.1V6.3z" fill="#0078D4"/>
          <path d="M24 6.3v-2c0-1.8-1.5-3.3-3.3-3.3H3.3C1.5 1.1 0 2.5 0 4.3v15.3c0 1.8 1.5 3.3 3.3 3.3H10v-8.8c0-1.1.7-2.1 1.8-2.4l10.7-3.2c.9-.3 1.5-1.1 1.5-2.1z" fill="#0078D4"/>
        </svg>;
      case 'yahoo':
        return <svg className="h-6 w-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0c6.617 0 12 5.383 12 12s-5.383 12-12 12S0 18.617 0 12 5.383 0 12 0z" fill="#6001D2"/>
          <path d="M9.276 7.035c.64.153 1.28.284 1.916.441.65.156 1.295.335 1.945.5.02-.083.032-.12.032-.157.003-.639.001-1.278.003-1.916 0-.05-.008-.1-.013-.157-1.287 0-2.546.001-3.815 0-.026 0-.052.009-.1.02.01.424.019.838.03 1.27zm-3.113 1.974c.637 0 1.25-.007 1.863.004.155.003.217-.05.287-.196.71-1.463 1.428-2.923 2.145-4.383.071-.146.145-.192.31-.192 1.012.009 2.024.005 3.035.004.165 0 .235.054.306.2.715 1.456 1.437 2.908 2.158 4.36.073.15.135.203.313.201a72.31 72.31 0 0 1 1.836-.003c.056 0 .113-.01.184-.016-.61-1.128-1.205-2.236-1.801-3.344-.728-1.354-1.444-2.714-2.192-4.057-.146-.262-.335-.439-.64-.49-.347-.058-.701-.086-1.052-.086-.805-.002-1.61.003-2.416-.002-.438-.003-.729.161-.954.52-1.312 2.399-2.636 4.792-3.957 7.186-.044.082-.082.167-.132.27.265-.002.506-.005.747-.005.991.001 1.981-.009 2.972.006.257.004.445-.086.568-.315.323-.6.673-1.187 1.013-1.778a.318.318 0 0 1 .3-.173c1.057.007 2.115.004 3.172.004.145 0 .235.028.3.179.32.727.652 1.449.964 2.179.052.12.09.196.26.195.888-.01 1.775-.005 2.662-.005.02 0 .041-.04.1-.1L13.336 9.01c-.992.002-1.952.005-2.912.005-.156 0-.232-.047-.301-.187-.225-.457-.461-.908-.687-1.363-.063-.126-.128-.172-.266-.168-.345.009-.69.003-1.065.003-.143.301-.28.586-.42.87-.148.302-.302.6-.447.903-.08.167-.182.23-.362.228-.359-.007-.717-.002-1.076-.002-.308 0-.616.002-.924-.001-.096-.001-.145.032-.183.122-.2.47-.408.936-.617 1.403-.43.098-.108.186-.164.28zm12.948 7.17c-1.408-1.026-2.799-2.041-4.22-3.076-.158.202-.314.403-.47.603-.16.203-.313.411-.482.607-.175.202-.348.22-.554.063-.41-.312-.824-.62-1.236-.927-.133-.1-.152-.171-.016-.3.13-.126.249-.262.362-.402.25-.306.489-.622.731-.933.184-.235.368-.47.56-.716-.252-.183-.502-.364-.75-.544l-1.012-.735c-.148-.11-.148-.207-.002-.324.11-.088.213-.183.32-.275l1.182-1.002c.09-.073.158-.093.27-.016 1.338.922 2.685 1.835 4.043 2.764.258-.334.508-.655.756-.978.11-.145.22-.29.334-.432.241-.3.476-.281.803-.112.4.206.795.425 1.19.64.145.078.17.14.077.3-.108.183-.207.371-.307.559-.309.575-.614 1.152-.924 1.726-.162.299-.161.3-.448.162-.4-.19-.8-.386-1.207-.582z" fill="#FFF"/>
        </svg>;
      default:
        return <Mail className="h-6 w-6" />;
    }
  };

  return (
    <Tabs defaultValue="connection" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="connection">Email Connection</TabsTrigger>
        <TabsTrigger value="signatures">Signatures</TabsTrigger>
      </TabsList>

      <TabsContent value="connection" className="space-y-6">
        {!isConnected ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Connect Email Account</CardTitle>
              <CardDescription>
                Connect your email account to automatically create bookings from customer emails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Select Email Provider</Label>
                <RadioGroup 
                  className="grid grid-cols-2 gap-4 pt-2" 
                  defaultValue={provider}
                  onValueChange={(value) => setProvider(value as any)}
                >
                  {['gmail', 'outlook', 'yahoo', 'other'].map((providerType) => (
                    <div key={providerType} className="flex items-center space-x-2">
                      <RadioGroupItem value={providerType} id={providerType} />
                      <Label 
                        htmlFor={providerType}
                        className="flex items-center gap-2 cursor-pointer rounded-lg border p-4 w-full"
                      >
                        {getProviderIcon(providerType)}
                        <div>
                          <div className="font-medium">{getProviderLabel(providerType)}</div>
                          <div className="text-sm text-muted-foreground">{getProviderDescription(providerType)}</div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {(provider === 'yahoo' || provider === 'other') && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      placeholder="your.email@example.com" 
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">
                      {provider === 'yahoo' ? 'App Password' : 'Password'}
                    </Label>
                    <Input 
                      id="password" 
                      type="password" 
                      placeholder={provider === 'yahoo' ? 'Yahoo App Password (not your regular password)' : 'Password'} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {provider === 'yahoo' && (
                      <p className="text-sm text-muted-foreground">
                        For Yahoo Mail, you need to generate an App Password in your{' '}
                        <a 
                          href="https://login.yahoo.com/account/security" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary underline"
                        >
                          Yahoo Account Security settings
                        </a>
                      </p>
                    )}
                  </div>

                  {/* Custom IMAP settings for "Other" provider */}
                  {provider === 'other' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="imap-host">IMAP Server Host</Label>
                        <Input
                          id="imap-host"
                          type="text"
                          placeholder="imap.example.com"
                          value={customHost}
                          onChange={(e) => setCustomHost(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="imap-port">IMAP Port</Label>
                        <Input
                          id="imap-port"
                          type="number"
                          placeholder="993"
                          value={customPort}
                          onChange={(e) => setCustomPort(e.target.value)}
                        />
                        <p className="text-sm text-muted-foreground">
                          Usually 993 for SSL/TLS or 143 for STARTTLS
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {lastError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error Connecting Account</AlertTitle>
                  <AlertDescription>
                    {lastError}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleConnect} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>Connect {getProviderLabel(provider)}</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Connected Account</CardTitle>
              <CardDescription>
                Your email account is connected and ready to use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-4">
                {getProviderIcon(provider)}
                <div>
                  <div className="font-medium">{emailAddress}</div>
                  <div className="text-sm text-muted-foreground">
                    {getProviderLabel(provider)} - Connected
                  </div>
                </div>
              </div>
              
              {connectionStatus === 'error' && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>
                    {lastError || 'There was an error with your email connection.'}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-create">Auto-create bookings from emails</Label>
                  <Switch 
                    id="auto-create" 
                    checked={autoCreateBookings}
                    onCheckedChange={(checked) => {
                      setAutoCreateBookings(checked);
                      handleUpdateSettings();
                    }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, bookings will be automatically created from emails containing booking requests
                </p>
              </div>

              {diagnosticMessage && (
                <Alert>
                  <AlertTitle>Diagnostic Results</AlertTitle>
                  <AlertDescription>
                    {diagnosticMessage}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2 items-stretch sm:flex-row sm:space-y-0 sm:space-x-2">
              <Button
                variant="outline"
                onClick={handleDiagnose}
                disabled={isDiagnosing}
                className="w-full"
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Diagnosing...
                  </>
                ) : (
                  <>Check Connection</>
                )}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDisconnect}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>Disconnect Account</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </>
      )}
      </TabsContent>

      <TabsContent value="signatures">
        <EmailSignatureSettings />
      </TabsContent>
    </Tabs>
  );
};

export default EmailSettings;
