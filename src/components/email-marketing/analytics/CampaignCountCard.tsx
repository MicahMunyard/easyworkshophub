
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { EmailAnalytic } from "../types";
import { calculateTotalSent } from "../utils/analyticsUtils";

interface CampaignCountCardProps {
  analytics: EmailAnalytic[];
}

const CampaignCountCard: React.FC<CampaignCountCardProps> = ({ analytics }) => {
  const totalSent = calculateTotalSent(analytics);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Total Campaigns</div>
        <div className="text-3xl font-bold">{analytics.length}</div>
        <div className="text-sm text-muted-foreground mt-1">
          {totalSent} total emails sent
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCountCard;
