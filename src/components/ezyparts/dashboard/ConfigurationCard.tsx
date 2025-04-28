
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface ConfigurationCardProps {
  apiStatus: 'loading' | 'connected' | 'error';
  accountId?: string;
  username?: string;
}

export const ConfigurationCard: React.FC<ConfigurationCardProps> = ({ 
  apiStatus, 
  accountId, 
  username 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Integration Settings
        </CardTitle>
        <CardDescription>Configure EzyParts integration</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Status:</span>
            <div className="flex items-center gap-2">
              {apiStatus === 'loading' && (
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
              )}
              {apiStatus === 'connected' && (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              )}
              {apiStatus === 'error' && (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm ${
                apiStatus === 'connected' ? 'text-green-600' : 
                apiStatus === 'error' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {apiStatus === 'connected' ? 'Connected' : 
                 apiStatus === 'error' ? 'Error' : 'Checking...'}
              </span>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">Account:</span>
            <span className="text-sm">{accountId || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">User:</span>
            <span className="text-sm">{username || 'Not set'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium">OAuth:</span>
            <span className="text-sm text-green-600">Configured ✓</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => navigate('/ezyparts/config')}
        >
          <Settings className="mr-2 h-4 w-4" />
          Configure
        </Button>
      </CardFooter>
    </Card>
  );
};
