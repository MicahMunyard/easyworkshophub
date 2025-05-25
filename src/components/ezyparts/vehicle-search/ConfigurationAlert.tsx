
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';

export const ConfigurationAlert: React.FC = () => {
  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="h-4 w-4 text-green-500" />
      <AlertDescription className="text-green-700">
        EzyParts integration is configured and ready to use.
      </AlertDescription>
    </Alert>
  );
};
