
import React from "react";
import { Label } from "@/components/ui/label";

interface EmailProviderSelectorProps {
  provider: string;
  setProvider: (provider: string) => void;
  disabled: boolean;
}

const EmailProviderSelector: React.FC<EmailProviderSelectorProps> = ({
  provider,
  setProvider,
  disabled
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email-provider">Email Provider</Label>
      <select
        id="email-provider"
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={provider}
        onChange={(e) => setProvider(e.target.value)}
        disabled={disabled}
      >
        <option value="gmail">Gmail</option>
        <option value="outlook">Outlook</option>
        <option value="yahoo">Yahoo Mail</option>
        <option value="other">Other (IMAP)</option>
      </select>
    </div>
  );
};

export default EmailProviderSelector;
