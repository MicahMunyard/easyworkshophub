
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, FileCode } from 'lucide-react';
import { useEzyPartsDashboard } from '@/hooks/ezyparts/useEzyPartsDashboard';
import { VehicleSearchCard } from '@/components/ezyparts/dashboard/VehicleSearchCard';
import { CurrentQuoteCard } from '@/components/ezyparts/dashboard/CurrentQuoteCard';
import { ConfigurationCard } from '@/components/ezyparts/dashboard/ConfigurationCard';
import { StatusAlerts } from '@/components/ezyparts/dashboard/StatusAlerts';

const EzyPartsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    apiStatus, 
    isConfigured, 
    currentQuote, 
    clearQuote, 
    credentials 
  } = useEzyPartsDashboard();

  // We need to ensure isConfigured is treated as a boolean
  const configuredStatus = typeof isConfigured === 'string' 
    ? isConfigured === 'true' 
    : Boolean(isConfigured);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EzyParts Integration Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/ezyparts/diagnostic')}>
            <FileCode className="mr-2 h-4 w-4" />
            Diagnostics
          </Button>
          <Button variant="outline" onClick={() => navigate('/ezyparts/config')}>
            <Settings className="mr-2 h-4 w-4" />
            Configuration
          </Button>
        </div>
      </div>

      <StatusAlerts 
        isConfigured={configuredStatus} 
        apiStatus={apiStatus} 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VehicleSearchCard isConfigured={configuredStatus} apiStatus={apiStatus} />
        <CurrentQuoteCard quote={currentQuote} onClearQuote={clearQuote} />
        <ConfigurationCard 
          apiStatus={apiStatus}
          accountId={credentials.accountId}
          username={credentials.username}
        />
      </div>
    </div>
  );
};

export default EzyPartsDashboard;
