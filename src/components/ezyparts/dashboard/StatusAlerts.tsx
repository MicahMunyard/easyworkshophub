
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { BoltIcon } from 'lucide-react';

interface StatusAlertsProps {
  isConfigured: boolean;
  apiStatus: 'loading' | 'connected' | 'error';
}

export const StatusAlerts: React.FC<StatusAlertsProps> = ({ isConfigured, apiStatus }) => {
  if (!isConfigured) {
    return (
      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Configuration Required</AlertTitle>
        <AlertDescription>
          EzyParts integration is not configured. Please set up your credentials to use this integration.
        </AlertDescription>
      </Alert>
    );
  }

  if (apiStatus === 'error') {
    return (
      <Alert variant="destructive" className="mb-6">
        <ExclamationTriangleIcon className="h-4 w-4" />
        <AlertTitle>Connection Error</AlertTitle>
        <AlertDescription>
          Could not connect to the EzyParts API. Please check your credentials and try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (apiStatus === 'connected') {
    return (
      <Alert className="mb-6 bg-green-50">
        <BoltIcon className="h-4 w-4" />
        <AlertTitle>Connected</AlertTitle>
        <AlertDescription>
          Successfully connected to the EzyParts API.
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};
