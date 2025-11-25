import React from "react";
import { useTierAccess } from "@/hooks/useTierAccess";
import { LockedPageView } from "./LockedPageView";

interface TierRouteProps {
  featureKey: string;
  children: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageFeatures?: string[];
  pageIcon?: React.ReactNode;
}

export const TierRoute: React.FC<TierRouteProps> = ({ 
  featureKey, 
  children,
  pageTitle = "Premium Feature",
  pageDescription = "This feature requires Full Access",
  pageFeatures = [],
  pageIcon
}) => {
  const { hasAccess, isLoading } = useTierAccess(featureKey);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <LockedPageView
        featureKey={featureKey}
        title={pageTitle}
        description={pageDescription}
        features={pageFeatures}
        icon={pageIcon}
      >
        {children}
      </LockedPageView>
    );
  }

  return <>{children}</>;
};
