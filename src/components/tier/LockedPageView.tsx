import React, { useState } from "react";
import { Lock, Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "./UpgradePrompt";

interface LockedPageViewProps {
  featureKey: string;
  title: string;
  description: string;
  features: string[];
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const LockedPageView: React.FC<LockedPageViewProps> = ({
  featureKey,
  title,
  description,
  features,
  icon,
  children,
}) => {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      {/* Blurred background showing actual page content */}
      <div className="absolute inset-0 filter blur-md opacity-30 pointer-events-none overflow-hidden">
        {children}
      </div>

      {/* Centered upgrade overlay */}
      <div className="relative z-10 flex items-center justify-center min-h-[600px] p-4 md:p-8">
        <Card className="max-w-2xl w-full bg-background/95 backdrop-blur-xl border-2 border-primary shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-4">
            {icon && (
              <div className="flex justify-center">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  {icon}
                </div>
              </div>
            )}
            <div>
              <CardTitle className="text-3xl font-bold mb-2">{title}</CardTitle>
              <CardDescription className="text-base">
                {description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Feature highlights */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                What's Included:
              </h4>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Upgrade button */}
            <div className="pt-4">
              <Button
                size="lg"
                className="w-full bg-workshop-red hover:bg-workshop-red/90 gap-2 text-base font-semibold"
                onClick={() => setShowUpgradePrompt(true)}
              >
                <Lock className="h-5 w-5" />
                Upgrade to Access
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Contact our sales team to unlock this feature and all Full Access benefits
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Upgrade prompt dialog */}
      <UpgradePrompt
        open={showUpgradePrompt}
        onOpenChange={setShowUpgradePrompt}
        featureKey={featureKey}
      />
    </div>
  );
};
