
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Search } from 'lucide-react';
import { useEzyPartsDashboard } from '@/hooks/ezyparts/useEzyPartsDashboard';
import { VehicleSearchCard } from '@/components/ezyparts/dashboard/VehicleSearchCard';
import { CurrentQuoteCard } from '@/components/ezyparts/dashboard/CurrentQuoteCard';

const EzyPartsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentQuote, clearQuote } = useEzyPartsDashboard();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">EzyParts Integration</h1>
        <Button onClick={() => navigate('/ezyparts/search')}>
          <Search className="mr-2 h-4 w-4" />
          Search Parts
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <VehicleSearchCard isConfigured={true} apiStatus="ok" />
        <CurrentQuoteCard quote={currentQuote} onClearQuote={clearQuote} />
      </div>
    </div>
  );
};

export default EzyPartsDashboard;
