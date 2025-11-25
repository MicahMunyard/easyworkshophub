import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TierFeature {
  feature_key: string;
  feature_name: string;
  enabled: boolean;
}

interface TierContextType {
  tier: 'tier1' | 'tier2' | null;
  features: Record<string, boolean>;
  hasFeatureAccess: (featureKey: string) => boolean;
  isLoading: boolean;
}

const TierContext = createContext<TierContextType>({
  tier: null,
  features: {},
  hasFeatureAccess: () => false,
  isLoading: true,
});

export const useTier = () => useContext(TierContext);

export const TierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [tier, setTier] = useState<'tier1' | 'tier2' | null>(null);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTierData = async () => {
      if (!profile?.subscription_tier) {
        setIsLoading(false);
        return;
      }

      try {
        setTier(profile.subscription_tier as 'tier1' | 'tier2');

        // Load tier features
        const { data: tierFeatures, error } = await supabase
          .from("tier_features")
          .select("feature_key, feature_name, enabled")
          .eq("tier", profile.subscription_tier);

        if (error) throw error;

        const featuresMap: Record<string, boolean> = {};
        tierFeatures?.forEach((feature: TierFeature) => {
          featuresMap[feature.feature_key] = feature.enabled;
        });

        setFeatures(featuresMap);
      } catch (error) {
        console.error("Error loading tier data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTierData();
  }, [profile?.subscription_tier]);

  const hasFeatureAccess = (featureKey: string): boolean => {
    return features[featureKey] === true;
  };

  return (
    <TierContext.Provider value={{ tier, features, hasFeatureAccess, isLoading }}>
      {children}
    </TierContext.Provider>
  );
};
