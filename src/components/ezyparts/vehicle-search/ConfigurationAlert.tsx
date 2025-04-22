
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const ConfigurationAlert: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTitle>Configuration Required</AlertTitle>
      <AlertDescription>
        EzyParts integration is not configured. Please set up your credentials first.
        <Button 
          variant="outline" 
          className="mt-2" 
          onClick={() => navigate('/ezyparts/config')}
        >
          Go to Configuration
        </Button>
      </AlertDescription>
    </Alert>
  );
};

