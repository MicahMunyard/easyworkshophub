
import React from "react";
import { EmailAnalyticsProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CampaignCountCard from "./analytics/CampaignCountCard";
import OpenRateCard from "./analytics/OpenRateCard";
import ClickRateCard from "./analytics/ClickRateCard";
import CampaignPerformanceChart from "./analytics/CampaignPerformanceChart";
import CampaignTimelineChart from "./analytics/CampaignTimelineChart";
import EmailEngagementChart from "./analytics/EmailEngagementChart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

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

  if (!analytics) {
    return (
      <Alert variant="warning" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No analytics data available. Start sending campaigns to generate insights.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <CampaignCountCard count={analytics.totalSent} />
        <OpenRateCard rate={analytics.openRate} />
        <ClickRateCard rate={analytics.clickRate} />
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
              <CampaignPerformanceChart data={analytics.campaignPerformance} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Email Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <CampaignTimelineChart data={analytics.emailTimeline} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <EmailEngagementChart 
                openRate={analytics.openRate} 
                clickRate={analytics.clickRate} 
                bounceRate={analytics.bounceRate} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EmailAnalytics;
