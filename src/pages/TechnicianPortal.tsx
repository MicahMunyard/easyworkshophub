
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TechnicianDashboard from "@/components/technician/TechnicianDashboard";
import TechnicianLogin from "@/components/technician/TechnicianLogin";
import TechPortalHeader from "@/components/technician/TechPortalHeader";
import TechnicianOfflineBanner from "@/components/technician/TechnicianOfflineBanner";
import { useTechnicianPortal } from "@/hooks/technician/useTechnicianPortal";

const TechnicianPortal = () => {
  const { user } = useAuth();
  const { isTechnicianAuthenticated, technicianProfile, isOffline } = useTechnicianPortal();
  
  if (!user) {
    return <Navigate to="/auth/signin" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <TechPortalHeader />
      {isOffline && <TechnicianOfflineBanner />}
      
      <div className="container mx-auto px-4 py-6">
        {isTechnicianAuthenticated ? (
          <TechnicianDashboard technicianProfile={technicianProfile} />
        ) : (
          <TechnicianLogin />
        )}
      </div>
    </div>
  );
};

export default TechnicianPortal;
