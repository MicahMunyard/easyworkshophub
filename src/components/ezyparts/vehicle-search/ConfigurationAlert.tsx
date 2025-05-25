
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ConfigurationAlert: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-500" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-blue-700">
          Make sure your EzyParts integration is configured before searching for vehicles.
        </span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/ezyparts/config')}
          className="ml-4"
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </AlertDescription>
    </Alert>
  );
};
