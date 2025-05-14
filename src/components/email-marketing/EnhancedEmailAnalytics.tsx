
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailAnalyticsProps } from './types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  TooltipProps
} from 'recharts';
import { 
  ArrowDownToLine, 
  Calendar, 
  MailOpen, 
  MousePointer2, 
  Send, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { prepareEngagementData, prepareCampaignPerformanceData, prepareCampaignTimelineData } from './utils/analyticsUtils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Custom tooltip formatting
const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Performance tooltip for percentage values
const PerformanceTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border p-2 rounded-md shadow-md">
        <p className="text-sm font-medium">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name === 'openRate' && 'Open Rate: '}
            {entry.name === 'clickRate' && 'Click Rate: '}
            {typeof entry.value === 'number' ? `${entry.value.toFixed(1)}%` : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EnhancedEmailAnalytics: React.FC<EmailAnalyticsProps> = ({ 
  analytics, 
  isLoading,
  exportAnalytics = () => Promise.resolve()
}) => {
  const [dateRange, setDateRange] = useState<string>('all');
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-24 flex items-center justify-center">
                  <div className="animate-pulse w-full">
                    <div className="h-4 bg-muted rounded w-1/3 mx-auto mb-2"></div>
                    <div className="h-8 bg-muted rounded w-1/2 mx-auto mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/4 mx-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <div className="h-5 bg-muted rounded w-1/4"></div>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics || analytics.length === 0) {
    return (
      <Card>
        <CardContent className="py-10">
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
            <p className="text-muted-foreground mb-6">
              Start sending campaigns to see performance metrics and analytics data.
            </p>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Create and send your first email campaign to generate analytics data.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const engagementData = prepareEngagementData(analytics);
  const performanceData = prepareCampaignPerformanceData(analytics);
  const timelineData = prepareCampaignTimelineData(analytics);

  // Calculate summary metrics
  const totalSent = analytics.reduce((sum, item) => sum + item.recipients, 0);
  const totalOpens = analytics.reduce((sum, item) => sum + item.opens, 0);
  const totalClicks = analytics.reduce((sum, item) => sum + item.clicks, 0);
  
  const averageOpenRate = totalSent ? (totalOpens / totalSent * 100) : 0;
  const averageClickRate = totalOpens ? (totalClicks / totalOpens * 100) : 0;

  const handleExport = (format: 'csv' | 'pdf') => {
    exportAnalytics(format);
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Sent</p>
                <div className="text-3xl font-bold">{totalSent.toLocaleString()}</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Across {analytics.length} campaigns
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <div className="text-3xl font-bold">{averageOpenRate.toFixed(1)}%</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <MailOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalOpens.toLocaleString()} total opens
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <div className="text-3xl font-bold">{averageClickRate.toFixed(1)}%</div>
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <MousePointer2 className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {totalClicks.toLocaleString()} total clicks
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Charts Section */}
      <div className="flex justify-between items-center">
        <Select
          value={dateRange}
          onValueChange={setDateRange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Download data</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleExport('csv')}>
              CSV Format
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport('pdf')}>
              PDF Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>
        
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart
                  data={performanceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 30,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{fontSize: 12}} height={60} interval={0} angle={-45} textAnchor="end" />
                  <YAxis yAxisId="left" orientation="left" tickFormatter={(value) => `${String(value)}%`} />
                  <Tooltip content={<PerformanceTooltip />} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="openRate" name="Open Rate" fill="#0088FE" />
                  <Bar yAxisId="left" dataKey="clickRate" name="Click Rate" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Email Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={timelineData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line type="monotone" dataKey="sent" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="opened" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="clicked" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Email Engagement Funnel</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col md:flex-row items-center justify-center">
                <div className="w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={engagementData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {engagementData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`${value} emails`, '']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 mt-6 md:mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-[#0088FE] mr-2"></div>
                      <div>
                        <p className="font-medium">Sent</p>
                        <p className="text-sm text-muted-foreground">{totalSent.toLocaleString()} emails delivered</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-[#00C49F] mr-2"></div>
                      <div>
                        <p className="font-medium">Opened</p>
                        <p className="text-sm text-muted-foreground">{totalOpens.toLocaleString()} emails opened ({averageOpenRate.toFixed(1)}%)</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="h-4 w-4 rounded-full bg-[#FFBB28] mr-2"></div>
                      <div>
                        <p className="font-medium">Clicked</p>
                        <p className="text-sm text-muted-foreground">{totalClicks.toLocaleString()} emails with clicks ({averageClickRate.toFixed(1)}%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Campaign Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Details</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Campaign</th>
                  <th className="text-left py-3 px-2">Date</th>
                  <th className="text-right py-3 px-2">Recipients</th>
                  <th className="text-right py-3 px-2">Opens</th>
                  <th className="text-right py-3 px-2">Clicks</th>
                  <th className="text-right py-3 px-2">Open Rate</th>
                  <th className="text-right py-3 px-2">Click Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((campaign, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-2">{campaign.campaign_name}</td>
                    <td className="py-3 px-2">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        <span>{format(new Date(campaign.sent_date), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-2">{campaign.recipients}</td>
                    <td className="text-right py-3 px-2">{campaign.opens}</td>
                    <td className="text-right py-3 px-2">{campaign.clicks}</td>
                    <td className="text-right py-3 px-2">
                      {((campaign.opens / campaign.recipients) * 100).toFixed(1)}%
                    </td>
                    <td className="text-right py-3 px-2">
                      {campaign.opens > 0 ? ((campaign.clicks / campaign.opens) * 100).toFixed(1) : "0.0"}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-3.5 w-3.5 mr-1" />
          Data refreshed {format(new Date(), 'MMM d, yyyy h:mm a')}
        </div>
      </div>
    </div>
  );
};

export default EnhancedEmailAnalytics;
