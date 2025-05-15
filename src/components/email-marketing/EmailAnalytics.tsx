
import React from "react";
import type { EmailAnalyticsProps } from "./types.d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCountCard from "./analytics/CampaignCountCard";
import OpenRateCard from "./analytics/OpenRateCard";
import ClickRateCard from "./analytics/ClickRateCard";
import CampaignPerformanceChart from "./analytics/CampaignPerformanceChart";
import CampaignTimelineChart from "./analytics/CampaignTimelineChart";
import EmailEngagementChart from "./analytics/EmailEngagementChart";
import { BarChart } from "lucide-react";

const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ analytics, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="py-10">
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse text-center">
                <div className="h-4 w-48 bg-muted rounded mb-4 mx-auto"></div>
                <div className="h-3 w-36 bg-muted rounded mb-6 mx-auto"></div>
                <div className="h-10 w-10 rounded-full bg-muted mx-auto"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="mx-auto bg-muted rounded-full w-12 h-12 flex items-center justify-center mb-4">
            <BarChart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No analytics data available</h3>
          <p className="text-muted-foreground mb-4">
            Start sending campaigns to generate insights and track performance metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CampaignCountCard analytics={analytics} />
        <OpenRateCard analytics={analytics} />
        <ClickRateCard analytics={analytics} />
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="timeline">Email Timeline</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignPerformanceChart analytics={analytics} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Email Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignTimelineChart analytics={analytics} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailEngagementChart analytics={analytics} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAnalytics;
