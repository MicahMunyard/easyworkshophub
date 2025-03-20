
import React from "react";
import { EmailAnalyticsProps } from "./types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { format, parseISO } from "date-fns";

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

  // Calculate total metrics
  const totalSent = analytics.reduce((sum, item) => sum + item.sent_count, 0);
  const totalOpens = analytics.reduce((sum, item) => sum + item.open_count, 0);
  const totalClicks = analytics.reduce((sum, item) => sum + item.click_count, 0);
  
  const openRate = totalSent ? (totalOpens / totalSent * 100).toFixed(1) : "0.0";
  const clickRate = totalOpens ? (totalClicks / totalOpens * 100).toFixed(1) : "0.0";
  
  // Prepare data for engagement funnel
  const engagementData = [
    { name: "Sent", value: totalSent },
    { name: "Opened", value: totalOpens },
    { name: "Clicked", value: totalClicks }
  ];
  
  // Prepare data for campaign performance
  const campaignPerformanceData = analytics.map(item => ({
    name: item.campaign_name,
    openRate: (item.open_count / item.sent_count * 100).toFixed(1),
    clickRate: (item.click_count / item.open_count * 100).toFixed(1)
  }));
  
  // Add date for campaigns in chart
  const campaignTimelineData = analytics.map(item => ({
    name: format(parseISO(item.date), "MMM d"),
    sent: item.sent_count,
    opened: item.open_count,
    clicked: item.click_count
  }));
  
  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Open Rate</div>
            <div className="text-3xl font-bold">{openRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalOpens} opens from {totalSent} sent
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Click Rate</div>
            <div className="text-3xl font-bold">{clickRate}%</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalClicks} clicks from {totalOpens} opens
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Campaigns</div>
            <div className="text-3xl font-bold">{analytics.length}</div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalSent} total emails sent
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Engagement Funnel</CardTitle>
            <CardDescription>Comparison of sent, opened, and clicked emails</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={engagementData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            {payload[0].value} emails
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="value" fill="#0891B2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Open rates and click rates by campaign</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={campaignPerformanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-background border border-border rounded p-2 shadow-md">
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            Open Rate: {payload[0].value}%
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Click Rate: {payload[1].value}%
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="openRate" name="Open Rate" fill="#0891B2" />
                <Bar dataKey="clickRate" name="Click Rate" fill="#22C55E" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign Timeline</CardTitle>
          <CardDescription>Email metrics over time</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={campaignTimelineData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded p-2 shadow-md">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                          Sent: {payload[0].value}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          Opened: {payload[1].value}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                          Clicked: {payload[2].value}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#0891B2" 
                name="Sent"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="opened" 
                stroke="#22C55E" 
                name="Opened"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="clicked" 
                stroke="#F59E0B" 
                name="Clicked"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailAnalytics;
