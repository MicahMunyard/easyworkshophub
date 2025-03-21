
import React from "react";
import { EmailAnalyticsProps } from "./types";
import OpenRateCard from "./analytics/OpenRateCard";
import ClickRateCard from "./analytics/ClickRateCard";
import CampaignCountCard from "./analytics/CampaignCountCard";
import EmailEngagementChart from "./analytics/EmailEngagementChart";
import CampaignPerformanceChart from "./analytics/CampaignPerformanceChart";
import CampaignTimelineChart from "./analytics/CampaignTimelineChart";

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  if (analytics.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OpenRateCard analytics={analytics} />
        <ClickRateCard analytics={analytics} />
        <CampaignCountCard analytics={analytics} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EmailEngagementChart analytics={analytics} />
        <CampaignPerformanceChart analytics={analytics} />
      </div>

      <CampaignTimelineChart analytics={analytics} />
    </div>
  );
};

export default EmailAnalytics;
