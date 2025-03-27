
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface EmailCredentialsProps {
  emailAddress: string;
  setEmailAddress: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  isConnected: boolean;
  isLoading: boolean;
}

const EmailCredentials: React.FC<EmailCredentialsProps> = ({
  emailAddress,
  setEmailAddress,
  password,
  setPassword,
  isConnected,
  isLoading
}) => {
  return (
    <>
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
        <>
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
          </div>
          
          <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Important Security Information</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-2">For services like Gmail, Yahoo, and Outlook that use 2-factor authentication, you'll need to create an app password instead of using your regular password.</p>
              <div className="flex flex-col space-y-1 text-sm mt-2">
                <a 
                  href="https://support.google.com/accounts/answer/185833" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> How to create a Gmail app password
                </a>
                <a 
                  href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> How to create an Outlook app password
                </a>
              </div>
            </AlertDescription>
          </Alert>
        </>
      )}
    </>
  );
};

export default EmailCredentials;
