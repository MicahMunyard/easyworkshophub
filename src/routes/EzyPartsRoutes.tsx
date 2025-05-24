
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { EzyPartsProvider } from '@/contexts/EzyPartsContext';
import VehicleSearch from '@/components/ezyparts/vehicle-search/VehicleSearch';
import QuoteHandler from '@/components/ezyparts/quote-handler/QuoteHandler';
import EzyPartsDashboard from '@/pages/EzyPartsDashboard';
import EzyPartsDiagnostic from '@/pages/EzyPartsDiagnostic';
import EzyPartsSelection from '@/pages/EzyPartsSelection';

const EzyPartsRoutes: React.FC = () => {
  return (
    <EzyPartsProvider>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<EzyPartsDashboard />} />
        <Route path="search" element={<VehicleSearch />} />
        <Route path="parts-selection" element={<EzyPartsSelection />} />
        <Route path="quote" element={<QuoteHandler />} />
        <Route path="diagnostic" element={<EzyPartsDiagnostic />} />
        <Route path="config" element={<EzyPartsDashboard />} />
      </Routes>
    </EzyPartsProvider>
  );
};

export default EzyPartsRoutes;
