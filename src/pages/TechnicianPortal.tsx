
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import TechnicianDashboard from "@/components/technician/TechnicianDashboard";
import TechnicianLogin from "@/components/technician/TechnicianLogin";
import TechPortalHeader from "@/components/technician/TechPortalHeader";
import TechnicianOfflineBanner from "@/components/technician/TechnicianOfflineBanner";
import { useTechnicianPortal } from "@/hooks/technician/useTechnicianPortal";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TechnicianPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const { 
    isTechnicianAuthenticated, 
    technicianProfile, 
    isOffline, 
    isLoading, 
    error, 
    logout 
  } = useTechnicianPortal();
  
  // Handle connection recovery attempt
  const handleRetryConnection = () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    // Check if we're actually online now
    if (navigator.onLine) {
      toast({
        title: "Connection available",
        description: "Refreshing your data...",
      });
      
      // Force page refresh to re-establish connections
      window.location.reload();
    } else {
      toast({
        title: "Still offline",
        description: "Please check your internet connection and try again.",
        variant: "destructive"
      });
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };
  
  // Show loading screen if auth is loading
  if (!user) {
    return <Navigate to="/auth/signin" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <TechPortalHeader />
      
      {isOffline && (
        <TechnicianOfflineBanner>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm font-medium text-white">
              You're currently offline. Limited functionality available.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetryConnection}
              disabled={isRetrying}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> 
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-1" /> 
                  Try again
                </>
              )}
            </Button>
          </div>
        </TechnicianOfflineBanner>
      )}
      
      <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading technician portal...</p>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-6 max-w-lg mx-auto text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Portal</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={handleRetryConnection} disabled={isRetrying}>
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </div>
        ) : isTechnicianAuthenticated ? (
          <TechnicianDashboard technicianProfile={technicianProfile} />
        ) : (
          <TechnicianLogin />
        )}
      </div>
    </div>
  );
};

export default TechnicianPortal;
