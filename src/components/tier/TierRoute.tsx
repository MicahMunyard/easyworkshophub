import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useTierAccess } from "@/hooks/useTierAccess";
import { UpgradePrompt } from "./UpgradePrompt";

interface TierRouteProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: 'redirect' | 'upgrade-prompt';
}

export const TierRoute: React.FC<TierRouteProps> = ({ 
  featureKey, 
  children, 
  fallback = 'redirect' 
}) => {
  const { hasAccess, isLoading } = useTierAccess(featureKey);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    if (!isLoading && !hasAccess && fallback === 'upgrade-prompt') {
      setShowUpgradePrompt(true);
    }
  }, [isLoading, hasAccess, fallback]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    if (fallback === 'upgrade-prompt') {
      return (
        <>
          <Navigate to="/" replace />
          <UpgradePrompt 
            open={showUpgradePrompt} 
            onOpenChange={setShowUpgradePrompt}
            featureKey={featureKey}
          />
        </>
      );
    }
    
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
