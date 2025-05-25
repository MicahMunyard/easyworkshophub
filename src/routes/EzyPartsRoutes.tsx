
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { EzyPartsProvider } from '@/contexts/EzyPartsContext';
import EzyPartsDashboard from '@/pages/EzyPartsDashboard';
import VehicleSearch from '@/components/ezyparts/vehicle-search/VehicleSearch';

const EzyPartsRoutes: React.FC = () => {
  return (
    <EzyPartsProvider>
      <Routes>
        <Route path="/" element={<EzyPartsDashboard />} />
        <Route path="/search" element={<VehicleSearch />} />
      </Routes>
    </EzyPartsProvider>
  );
};

export default EzyPartsRoutes;
