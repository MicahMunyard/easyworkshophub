
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
  // Always declare all hooks at the top
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    isTechnicianAuthenticated, 
    technicianProfile, 
    isOffline, 
    logout 
  } = useTechnicianPortal();
  
  // Set loading state to false when data is loaded
  useEffect(() => {
    if (isTechnicianAuthenticated !== undefined) {
      setIsLoading(false);
    }
  }, [isTechnicianAuthenticated]);
  
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
  
  // Only conditionally return after all hooks are defined
  if (!user) {
    return <Navigate to="/auth/signin" />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      <TechPortalHeader />
      
      {isOffline && (
        <TechnicianOfflineBanner onRetry={handleRetryConnection} isRetrying={isRetrying} />
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
