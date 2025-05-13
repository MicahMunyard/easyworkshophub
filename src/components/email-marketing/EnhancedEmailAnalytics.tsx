
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
import { BarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const EnhancedEmailAnalytics: React.FC<EmailAnalyticsProps> = ({ 
  analytics, 
  isLoading,
  exportAnalytics 
}) => {
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
      <div className="flex justify-end">
        {exportAnalytics && (
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalytics}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
        )}
      </div>
      
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
            <CardContent className="space-y-8">
              <EmailEngagementChart analytics={analytics} />
              
              <div className="border-t pt-4">
                <h3 className="font-medium mb-4">Campaign Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-medium px-2 py-2">Campaign</th>
                        <th className="text-left font-medium px-2 py-2">Sent</th>
                        <th className="text-left font-medium px-2 py-2">Opens</th>
                        <th className="text-left font-medium px-2 py-2">Clicks</th>
                        <th className="text-left font-medium px-2 py-2">Open Rate</th>
                        <th className="text-left font-medium px-2 py-2">Click Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.map((campaign) => (
                        <tr key={campaign.campaign_id} className="border-b hover:bg-muted/50">
                          <td className="px-2 py-2">{campaign.campaign_name}</td>
                          <td className="px-2 py-2">{campaign.recipients}</td>
                          <td className="px-2 py-2">{campaign.opens}</td>
                          <td className="px-2 py-2">{campaign.clicks}</td>
                          <td className="px-2 py-2">
                            {campaign.recipients > 0 ? 
                              `${((campaign.opens / campaign.recipients) * 100).toFixed(1)}%` : 
                              '0.0%'}
                          </td>
                          <td className="px-2 py-2">
                            {campaign.opens > 0 ? 
                              `${((campaign.clicks / campaign.opens) * 100).toFixed(1)}%` : 
                              '0.0%'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedEmailAnalytics;
