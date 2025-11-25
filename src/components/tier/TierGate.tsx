import React from "react";
import { useTierAccess } from "@/hooks/useTierAccess";
import { LockedFeatureOverlay } from "./LockedFeatureOverlay";

interface TierGateProps {
  featureKey: string;
  children: React.ReactNode;
  fallback?: 'blur' | 'hide' | 'message';
  upgradeMessage?: string;
}

export const TierGate: React.FC<TierGateProps> = ({ 
  featureKey, 
  children, 
  fallback = 'blur',
  upgradeMessage 
}) => {
  const { hasAccess, isLoading } = useTierAccess(featureKey);

  if (isLoading) {
    return null;
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access
  if (fallback === 'hide') {
    return null;
  }

  if (fallback === 'message') {
    return (
      <div className="p-4 bg-muted rounded-lg text-center">
        <p className="text-muted-foreground">
          {upgradeMessage || "Upgrade to Full Access to unlock this feature"}
        </p>
      </div>
    );
  }

  // Default: blur fallback
  return (
    <div className="relative">
      <div className="filter blur-sm opacity-60 pointer-events-none">
        {children}
      </div>
      <LockedFeatureOverlay featureKey={featureKey} />
    </div>
  );
};
