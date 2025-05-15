
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { EmailAnalytic } from "../types.d";
import { calculateOpenRate, calculateTotalSent, calculateTotalOpens } from "../utils/analyticsUtils";

interface OpenRateCardProps {
  analytics: EmailAnalytic[];
}

const OpenRateCard: React.FC<OpenRateCardProps> = ({ analytics }) => {
  const openRate = calculateOpenRate(analytics);
  const totalOpens = calculateTotalOpens(analytics);
  const totalSent = calculateTotalSent(analytics);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Open Rate</div>
        <div className="text-3xl font-bold">{openRate}%</div>
        <div className="text-sm text-muted-foreground mt-1">
          {totalOpens} opens from {totalSent} sent
        </div>
      </CardContent>
    </Card>
  );
};

export default OpenRateCard;
