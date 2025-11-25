import React, { useState } from "react";
import { Lock } from "lucide-react";
import { UpgradePrompt } from "./UpgradePrompt";

interface LockedFeatureOverlayProps {
  featureKey: string;
}

export const LockedFeatureOverlay: React.FC<LockedFeatureOverlayProps> = ({ featureKey }) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  return (
    <>
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg cursor-pointer z-10"
        onClick={() => setShowUpgradePrompt(true)}
      >
        <Lock className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-foreground">Upgrade Required</p>
        <p className="text-xs text-muted-foreground mt-1">Click to learn more</p>
      </div>
      
      <UpgradePrompt 
        open={showUpgradePrompt} 
        onOpenChange={setShowUpgradePrompt}
        featureKey={featureKey}
      />
    </>
  );
};
