
import React, { useState } from "react";
import { EmailAnalyticsProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, BarChart3, Calendar, Zap } from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Legend, 
  Line, 
  LineChart, 
  Pie, 
  PieChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

const EnhancedEmailAnalytics: React.FC<EmailAnalyticsProps> = ({ 
  analytics, 
  isLoading,
  exportAnalytics 
}) => {
  const [dateRange, setDateRange] = useState<string>("30days");
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-end mb-4">
          <div className="h-9 w-32 bg-muted rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-5 bg-muted rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted rounded w-full"></div>
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
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-medium text-lg mb-2">No campaign data available yet</h3>
          <p className="text-muted-foreground mb-4">
            Send your first email campaign to start tracking performance metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Calculate aggregate metrics
  const totalSent = analytics.reduce((sum, campaign) => sum + campaign.recipients, 0);
  const totalOpens = analytics.reduce((sum, campaign) => sum + campaign.opens, 0);
  const totalClicks = analytics.reduce((sum, campaign) => sum + campaign.clicks, 0);
  
  const averageOpenRate = totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0;
  const averageClickRate = totalOpens > 0 ? Math.round((totalClicks / totalOpens) * 100) : 0;
  
  const sortedAnalytics = [...analytics].sort((a, b) => 
    new Date(b.sent_date).getTime() - new Date(a.sent_date).getTime()
  );
  
  const performanceData = sortedAnalytics.map(campaign => ({
    name: campaign.campaign_name,
    openRate: campaign.opens / campaign.recipients * 100,
    clickRate: campaign.clicks / campaign.recipients * 100
  }));
  
  const timelineData = sortedAnalytics.map(campaign => ({
    date: new Date(campaign.sent_date).toLocaleDateString(),
    recipients: campaign.recipients,
    opens: campaign.opens,
    clicks: campaign.clicks
  }));

  // Engagement data for pie chart
  const engagementData = [
    { name: 'Opened', value: totalOpens, color: '#4ade80' },
    { name: 'Not Opened', value: Math.max(0, totalSent - totalOpens), color: '#f87171' }
  ];

  const handleExport = (format: 'csv' | 'pdf') => {
    if (exportAnalytics) {
      exportAnalytics(format);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={dateRange} onValueChange={setDateRange} className="w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="30days">Last 30 Days</TabsTrigger>
            <TabsTrigger value="90days">Last 90 Days</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {exportAnalytics && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('csv')}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-1"
            >
              <FileDown className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across {analytics.length} campaign{analytics.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOpenRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Industry average: 21.33%
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Click Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageClickRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Industry average: 2.62%
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" /> Performance
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Timeline
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-1">
            <Zap className="h-4 w-4" /> Engagement
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={performanceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value.toFixed(1)}%`, undefined]}
                    />
                    <Legend />
                    <Bar dataKey="openRate" name="Open Rate" fill="#22c55e" />
                    <Bar dataKey="clickRate" name="Click Rate" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Email Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={timelineData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end"
                      height={70} 
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="recipients" 
                      name="Recipients" 
                      stackId="1"
                      stroke="#9ca3af" 
                      fill="#d1d5db" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="opens" 
                      name="Opens" 
                      stackId="2"
                      stroke="#22c55e" 
                      fill="#4ade80" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="clicks" 
                      name="Clicks" 
                      stackId="3"
                      stroke="#3b82f6" 
                      fill="#60a5fa" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [value, 'Recipients']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={sortedAnalytics.map(campaign => ({
                        name: campaign.campaign_name,
                        openRate: (campaign.opens / campaign.recipients) * 100,
                        clickRate: (campaign.clicks / campaign.opens) * 100
                      }))}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45} 
                        textAnchor="end"
                        height={70} 
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value.toFixed(1)}%`, undefined]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="openRate" 
                        name="Open Rate" 
                        stroke="#22c55e" 
                        activeDot={{ r: 8 }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="clickRate" 
                        name="Click-to-Open Rate" 
                        stroke="#3b82f6" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
