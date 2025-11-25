import { useTier } from "@/contexts/TierContext";

export const useTierAccess = (featureKey: string) => {
  const { tier, hasFeatureAccess, isLoading } = useTier();
  
  return {
    hasAccess: hasFeatureAccess(featureKey),
    tier,
    isLoading
  };
};
