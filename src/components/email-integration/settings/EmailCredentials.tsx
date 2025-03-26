
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

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
    </>
  );
};

export default EmailCredentials;
