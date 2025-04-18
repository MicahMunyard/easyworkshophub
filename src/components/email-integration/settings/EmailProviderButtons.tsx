
import React from "react";
import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EmailProviderButtonsProps {
  onSelectProvider: (provider: "gmail" | "outlook" | "yahoo" | "other") => void;
  isLoading: boolean;
}

const EmailProviderButtons: React.FC<EmailProviderButtonsProps> = ({
  onSelectProvider,
  isLoading
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Choose your email provider</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-20 flex-col justify-center items-center"
          onClick={() => onSelectProvider("gmail")}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-red-600" fill="currentColor">
              <path d="M20,18H18V9.237L12,13L6,9.237V18H4V6H5.441L12,10.267L18.559,6H20V18M20,4H4A2,2 0 0,0 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6A2,2 0 0,0 20,4Z" />
            </svg>
          </div>
          <span>Gmail</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-20 flex-col justify-center items-center"
          onClick={() => onSelectProvider("outlook")}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-600" fill="currentColor">
              <path d="M7.88,12.04C8.32,12.04 8.69,11.96 9,11.81C9.27,11.67 9.5,11.5 9.69,11.25C9.88,11.01 10.01,10.71 10.09,10.37C10.17,10.03 10.21,9.64 10.21,9.21C10.21,8.87 10.17,8.54 10.1,8.24C10.03,7.94 9.91,7.69 9.74,7.47C9.57,7.26 9.36,7.09 9.09,6.97C8.82,6.85 8.49,6.8 8.09,6.8H6V12.04H7.88M7.61,7.69C7.79,7.69 7.94,7.72 8.08,7.79C8.22,7.86 8.32,7.95 8.4,8.07C8.48,8.19 8.54,8.34 8.57,8.53C8.61,8.72 8.63,8.94 8.63,9.21C8.63,9.46 8.61,9.69 8.58,9.89C8.55,10.1 8.49,10.26 8.4,10.39C8.31,10.52 8.2,10.62 8.05,10.69C7.9,10.77 7.73,10.8 7.54,10.8H7.25V7.69H7.61Z" />
            </svg>
          </div>
          <span>Outlook</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-20 flex-col justify-center items-center"
          onClick={() => onSelectProvider("yahoo")}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full mb-2">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-purple-600" fill="currentColor">
              <path d="M11.75,12.91C10.81,12.91 10.36,12.77 9.33,12.28L9,12.91L9.74,12.91C9.74,13.88 9.67,16 7.86,16C6.62,16 6,15.09 6,14.27C6,13.29 6.41,12.71 7.87,12.15C7.87,12.15 8.33,13.36 8.33,14.16C8.33,14.97 8.53,15.12 8.76,15.12C9.13,15.12 9.24,14.97 9.24,13.8L9.24,11.68L7.39,6.72L6.65,6.72C6.5,5.44 6.5,5.44 6.5,5.38L9.74,5.38C9.89,6.66 9.89,6.66 9.89,6.72L9.03,6.72L9.74,8.91L10.58,6.72L9.74,6.72C9.59,5.44 9.59,5.44 9.59,5.38L13.33,5.38L13.33,5.72L12.56,5.72C12.5,5.78 12.03,7.07 11.42,8.21C10.79,9.33 10.79,9.33 10.73,9.39C10.73,9.39 11.63,10.62 12.28,11.67C12.93,12.71 12.93,12.71 13,12.77L12.19,12.77C12.12,12.83 11.75,12.91 11.75,12.91M13.92,5.38L17.63,5.38C17.8,6.66 17.8,6.66 17.8,6.72L17.03,6.72L17.92,9.94L18.77,6.72L17.92,6.72C17.77,5.44 17.77,5.44 17.77,5.38L19.88,5.38L20.42,11.12C20.44,11.49 20.44,11.49 20.5,11.55C20.56,11.61 20.69,11.67 21,11.73L21,12L17.8,12L17.8,11.73C18.19,11.64 18.29,11.58 18.36,11.49C18.44,11.39 18.44,11.3 18.38,10.86L18.27,10.08L16.62,10.08L16.45,10.86C16.38,11.27 16.38,11.39 16.45,11.49C16.5,11.58 16.63,11.64 17.05,11.73L17.05,12L14,12L14,11.73L14.22,11.67C14.5,11.61 14.61,11.55 14.69,11.46C14.76,11.36 14.8,11.21 14.86,10.74L15.61,5.8M17.06,6.72L16.66,9.17L18.22,9.17L17.92,6.72L17.06,6.72Z" />
            </svg>
          </div>
          <span>Yahoo</span>
        </Button>

        <Button 
          variant="outline" 
          className="h-20 flex-col justify-center items-center"
          onClick={() => onSelectProvider("other")}
          disabled={isLoading}
        >
          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-2">
            <Mail className="h-6 w-6 text-gray-600" />
          </div>
          <span>Other IMAP</span>
        </Button>
      </div>
      
      <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800 mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <p className="text-sm">
            Click the button above for your email provider to begin the connection process. Gmail and Outlook use OAuth for secure authentication, 
            while other providers require your email credentials.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default EmailProviderButtons;
