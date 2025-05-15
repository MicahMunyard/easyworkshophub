
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { EmailAnalytic } from "../types.d";
import { calculateClickRate, calculateTotalOpens, calculateTotalClicks } from "../utils/analyticsUtils";

interface ClickRateCardProps {
  analytics: EmailAnalytic[];
}

const ClickRateCard: React.FC<ClickRateCardProps> = ({ analytics }) => {
  const clickRate = calculateClickRate(analytics);
  const totalClicks = calculateTotalClicks(analytics);
  const totalOpens = calculateTotalOpens(analytics);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Click Rate</div>
        <div className="text-3xl font-bold">{clickRate}%</div>
        <div className="text-sm text-muted-foreground mt-1">
          {totalClicks} clicks from {totalOpens} opens
        </div>
      </CardContent>
    </Card>
  );
};

export default ClickRateCard;
