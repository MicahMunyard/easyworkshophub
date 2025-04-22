
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { EzyPartsProvider } from '@/contexts/EzyPartsContext';
import VehicleSearch from '@/components/ezyparts/vehicle-search/VehicleSearch';
import QuoteHandler from '@/components/ezyparts/quote-handler/QuoteHandler';
import { Card } from '@/components/ui/card';

// Placeholder component for EzyParts config
const EzyPartsConfig = () => (
  <Card className="p-6">
    <h2 className="text-2xl font-bold mb-4">EzyParts Configuration</h2>
    <p>Configure your EzyParts integration settings here.</p>
  </Card>
);

// Placeholder component for dashboard
const EzyPartsDashboard = () => (
  <Card className="p-6">
    <h2 className="text-2xl font-bold mb-4">EzyParts Dashboard</h2>
    <p>View your EzyParts integration statistics and status here.</p>
  </Card>
);

const EzyPartsRoutes: React.FC = () => {
  return (
    <EzyPartsProvider>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EzyPartsDashboard />} />
        <Route path="search" element={<VehicleSearch />} />
        <Route path="quote" element={<QuoteHandler />} />
        <Route path="config" element={<EzyPartsConfig />} />
      </Routes>
    </EzyPartsProvider>
  );
};

export default EzyPartsRoutes;
