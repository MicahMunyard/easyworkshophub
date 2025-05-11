
import React, { useState } from "react";
import { EnhancedEmailAnalyticsProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, ChevronDown, ChevronUp, TrendingDown, TrendingUp, Calendar, Filter, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { format, isValid, parseISO, subDays } from "date-fns";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Extended analytics types for more detailed metrics
interface DetailedAnalytics {
  deliveryRate: number;
  bounceRate: number;
  openRate: number;
  clickRate: number;
  ctorRate: number; // Click-to-open rate
  unsubscribeRate: number;
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  campaigns: number;
  averageOpenTime: number; // in hours
  deviceBreakdown: {
    desktop: number;
    mobile: number;
    tablet: number;
  };
  trend: {
    openRate: 'up' | 'down' | 'stable';
    clickRate: 'up' | 'down' | 'stable';
  };
}

// Enhanced chart data type
interface EnhancedChartData {
  name: string;
  value?: number;
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
  unsubscribed?: number;
  openRate?: number;
  clickRate?: number;
  desktop?: number;
  mobile?: number;
  tablet?: number;
  [key: string]: any; // For flexibility with other metrics
}

// Sample device breakdown data - in a real app this would come from analytics
const deviceBreakdownData = [
  { name: 'Desktop', value: 45 },
  { name: 'Mobile', value: 40 },
  { name: 'Tablet', value: 15 },
];

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const EnhancedEmailAnalytics: React.FC<EnhancedEmailAnalyticsProps> = ({ 
  analytics, 
  isLoading,
  exportAnalytics 
}) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState("openRate");
  const [selectedView, setSelectedView] = useState("overview");
  const [selectedCampaign, setSelectedCampaign] = useState<string | undefined>(undefined);

  // Process analytics data
  const calculateDetailedAnalytics = (): DetailedAnalytics => {
    // Filter analytics by date range and selected campaign if applicable
    const filteredAnalytics = analytics
      .filter(item => {
        // Filter by date if range is set
        if (dateRange?.from && dateRange?.to) {
          const itemDate = parseISO(item.date);
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        }
        return true;
      })
      .filter(item => {
        // Filter by campaign if selected
        if (selectedCampaign) {
          return item.campaign_id === selectedCampaign;
        }
        return true;
      });

    // Calculate totals
    const totalSent = filteredAnalytics.reduce((sum, item) => sum + item.sent_count, 0);
    const totalOpened = filteredAnalytics.reduce((sum, item) => sum + item.open_count, 0);
    const totalClicked = filteredAnalytics.reduce((sum, item) => sum + item.click_count, 0);
    
    // We'll simulate some metrics that might not be in the original data
    const totalDelivered = totalSent - (totalSent * 0.02); // Assume 2% bounce rate
    const totalBounced = totalSent * 0.02;
    const totalUnsubscribed = totalSent * 0.005; // Assume 0.5% unsubscribe rate

    // Calculate rates
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    const openRate = totalDelivered > 0 ? (totalOpened / totalDelivered) * 100 : 0;
    const clickRate = totalDelivered > 0 ? (totalClicked / totalDelivered) * 100 : 0;
    const ctorRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const unsubscribeRate = totalDelivered > 0 ? (totalUnsubscribed / totalDelivered) * 100 : 0;

    // Determine trends (simplified logic - in reality would compare to previous period)
    const openRateTrend = openRate > 25 ? 'up' : 'down';
    const clickRateTrend = clickRate > 3 ? 'up' : 'down';

    return {
      deliveryRate: parseFloat(deliveryRate.toFixed(1)),
      bounceRate: parseFloat(bounceRate.toFixed(1)),
      openRate: parseFloat(openRate.toFixed(1)),
      clickRate: parseFloat(clickRate.toFixed(1)),
      ctorRate: parseFloat(ctorRate.toFixed(1)),
      unsubscribeRate: parseFloat(unsubscribeRate.toFixed(1)),
      totalSent,
      totalDelivered: Math.round(totalDelivered),
      totalOpened,
      totalClicked,
      totalBounced: Math.round(totalBounced),
      totalUnsubscribed: Math.round(totalUnsubscribed),
      campaigns: filteredAnalytics.length,
      averageOpenTime: 2.4, // Mock data, would be calculated from actual timestamps
      deviceBreakdown: {
        desktop: 45,
        mobile: 40,
        tablet: 15
      },
      trend: {
        openRate: openRateTrend,
        clickRate: clickRateTrend
      }
    };
  };

  // Prepare time series data
  const prepareTimeSeriesData = (): EnhancedChartData[] => {
    // Group by date and sum metrics
    const dateMap = new Map<string, EnhancedChartData>();
    
    analytics
      .filter(item => {
        // Filter by date if range is set
        if (dateRange?.from && dateRange?.to) {
          const itemDate = parseISO(item.date);
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        }
        return true;
      })
      .filter(item => {
        // Filter by campaign if selected
        if (selectedCampaign) {
          return item.campaign_id === selectedCampaign;
        }
        return true;
      })
      .forEach(item => {
        const date = format(parseISO(item.date), 'MMM d');
        
        if (!dateMap.has(date)) {
          dateMap.set(date, { 
            name: date,
            sent: 0,
            opened: 0,
            clicked: 0,
            openRate: 0,
            clickRate: 0
          });
        }
        
        const existing = dateMap.get(date)!;
        existing.sent = (existing.sent || 0) + item.sent_count;
        existing.opened = (existing.opened || 0) + item.open_count;
        existing.clicked = (existing.clicked || 0) + item.click_count;
        existing.openRate = existing.sent ? (existing.opened / existing.sent) * 100 : 0;
        existing.clickRate = existing.sent ? (existing.clicked / existing.sent) * 100 : 0;
      });
    
    // Convert map to array and sort by date
    return Array.from(dateMap.values())
      .sort((a, b) => {
        const dateA = new Date(a.name);
        const dateB = new Date(b.name);
        return dateA.getTime() - dateB.getTime();
      });
  };

  // Prepare campaign performance data
  const prepareCampaignPerformanceData = (): EnhancedChartData[] => {
    return analytics
      .filter(item => {
        // Filter by date if range is set
        if (dateRange?.from && dateRange?.to) {
          const itemDate = parseISO(item.date);
          return itemDate >= dateRange.from && itemDate <= dateRange.to;
        }
        return true;
      })
      .map(item => ({
        name: item.campaign_name,
        sent: item.sent_count,
        opened: item.open_count,
        clicked: item.click_count,
        openRate: (item.open_count / item.sent_count) * 100,
        clickRate: (item.click_count / item.sent_count) * 100,
        ctorRate: item.open_count ? (item.click_count / item.open_count) * 100 : 0
      }));
  };

  // Get unique campaigns for filtering
  const getCampaigns = (): { id: string; name: string }[] => {
    const campaignMap = new Map<string, string>();
    
    analytics.forEach(item => {
      if (!campaignMap.has(item.campaign_id)) {
        campaignMap.set(item.campaign_id, item.campaign_name);
      }
    });
    
    return Array.from(campaignMap.entries()).map(([id, name]) => ({ id, name }));
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!dateRange?.from || !dateRange?.to) {
      return "All Time";
    }
    
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  // Get trend icon based on direction
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (trend === 'down') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  // Handle export analytics
  const handleExport = async (format: 'csv' | 'pdf') => {
    if (exportAnalytics) {
      await exportAnalytics(format);
    }
  };

  // Calculate detailed analytics
  const detailedAnalytics = calculateDetailedAnalytics();

  // Prepare chart data
  const timeSeriesData = prepareTimeSeriesData();
  const campaignPerformanceData = prepareCampaignPerformanceData();
  const campaigns = getCampaigns();

  // Loading state
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

  // No data state
  if (!analytics || analytics.length === 0) {
    return (
      <Alert variant="default" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No analytics data available. Start sending campaigns to generate insights.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters & Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDateRange()}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange({
                            from: subDays(new Date(), 7),
                            to: new Date()
                          })}
                        >
                          Last 7 days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange({
                            from: subDays(new Date(), 30),
                            to: new Date()
                          })}
                        >
                          Last 30 days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange({
                            from: subDays(new Date(), 90),
                            to: new Date()
                          })}
                        >
                          Last 90 days
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDateRange(undefined)}
                        >
                          All time
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {campaigns.length > 0 && (
                <Select
                  value={selectedCampaign || ""}
                  onValueChange={(value) => setSelectedCampaign(value === "" ? undefined : value)}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Campaigns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Campaigns</SelectItem>
                    {campaigns.map(campaign => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Select
                value={selectedView}
                onValueChange={setSelectedView}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Overview" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Overview</SelectItem>
                  <SelectItem value="campaigns">Campaigns</SelectItem>
                  <SelectItem value="engagement">Engagement</SelectItem>
                  <SelectItem value="devices">Devices</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto" align="end">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleExport('csv')}
                    >
                      Export as CSV
                    </Button>
                    <Button
                      variant="ghost"
                      className="justify-start"
                      onClick={() => handleExport('pdf')}
                    >
                      Export as PDF
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Open Rate</div>
                <div className="text-3xl font-bold">{detailedAnalytics.openRate}%</div>
              </div>
              <div className="flex items-center">
                {getTrendIcon(detailedAnalytics.trend.openRate)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {detailedAnalytics.totalOpened} opens from {detailedAnalytics.totalSent} sent
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Click Rate</div>
                <div className="text-3xl font-bold">{detailedAnalytics.clickRate}%</div>
              </div>
              <div className="flex items-center">
                {getTrendIcon(detailedAnalytics.trend.clickRate)}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {detailedAnalytics.totalClicked} clicks from {detailedAnalytics.totalDelivered} delivered
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">CTOR</div>
                <div className="text-3xl font-bold">{detailedAnalytics.ctorRate}%</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Click-to-open rate
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Campaigns</div>
                <div className="text-3xl font-bold">{detailedAnalytics.campaigns}</div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {detailedAnalytics.totalSent} total emails sent
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      {selectedView === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Email campaign performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={timeSeriesData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
                            <p className="text-sm flex items-center">
                              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                              Sent: {payload[0].value}
                            </p>
                            <p className="text-sm flex items-center">
                              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                              Opened: {payload[1].value}
                            </p>
                            <p className="text-sm flex items-center">
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
                  <Area 
                    type="monotone" 
                    dataKey="sent" 
                    stackId="1"
                    stroke="#0088FE" 
                    fill="#0088FE" 
                    name="Sent"
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="opened" 
                    stackId="2"
                    stroke="#00C49F" 
                    fill="#00C49F" 
                    name="Opened"
                    fillOpacity={0.2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="clicked" 
                    stackId="3"
                    stroke="#FFBB28" 
                    fill="#FFBB28" 
                    name="Clicked"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Delivery Rate</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-semibold mr-2">{detailedAnalytics.deliveryRate}%</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Good
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Bounce Rate</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-semibold mr-2">{detailedAnalytics.bounceRate}%</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Low
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Unsubscribe Rate</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-semibold mr-2">{detailedAnalytics.unsubscribeRate}%</div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Low
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Avg. Open Time</h3>
                <div className="flex items-center">
                  <div className="text-2xl font-semibold mr-2">{detailedAnalytics.averageOpenTime}h</div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Average
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'campaigns' && (
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Comparison of individual campaign metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={campaignPerformanceData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded p-2 shadow-md">
                            <p className="font-medium">{label}</p>
                            <p className="text-sm flex items-center">
                              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                              Open Rate: {payload[0].value.toFixed(1)}%
                            </p>
                            <p className="text-sm flex items-center">
                              <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                              Click Rate: {payload[1].value.toFixed(1)}%
                            </p>
                            <p className="text-sm flex items-center">
                              <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
                              CTOR: {payload[2].value.toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="openRate" name="Open Rate" fill="#0088FE" />
                  <Bar dataKey="clickRate" name="Click Rate" fill="#00C49F" />
                  <Bar dataKey="ctorRate" name="CTOR" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'engagement' && (
        <Card>
          <CardHeader>
            <CardTitle>Engagement Funnel</CardTitle>
            <CardDescription>Visualizing the email engagement journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Sent", value: detailedAnalytics.totalSent },
                      { name: "Delivered", value: detailedAnalytics.totalDelivered },
                      { name: "Opened", value: detailedAnalytics.totalOpened },
                      { name: "Clicked", value: detailedAnalytics.totalClicked },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0088FE">
                      {[
                        { name: "Sent", value: detailedAnalytics.totalSent },
                        { name: "Delivered", value: detailedAnalytics.totalDelivered },
                        { name: "Opened", value: detailedAnalytics.totalOpened },
                        { name: "Clicked", value: detailedAnalytics.totalClicked },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-4">Engagement Breakdown</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Sent</span>
                      </div>
                      <div className="font-medium">{detailedAnalytics.totalSent}</div>
                      <div>100%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Delivered</span>
                      </div>
                      <div className="font-medium">{detailedAnalytics.totalDelivered}</div>
                      <div>{detailedAnalytics.deliveryRate}%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span>Opened</span>
                      </div>
                      <div className="font-medium">{detailedAnalytics.totalOpened}</div>
                      <div>{detailedAnalytics.openRate}%</div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span>Clicked</span>
                      </div>
                      <div className="font-medium">{detailedAnalytics.totalClicked}</div>
                      <div>{detailedAnalytics.clickRate}%</div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Engagement Insights</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Your open rate is {detailedAnalytics.openRate > 25 ? "above" : "below"} industry average (25%)</li>
                        <li>Your click rate is {detailedAnalytics.clickRate > 3 ? "above" : "below"} industry average (3%)</li>
                        <li>Consider {detailedAnalytics.clickRate < 3 ? "improving your call-to-action buttons" : "maintaining your effective CTAs"}</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'devices' && (
        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>How customers are viewing your emails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {deviceBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Device Insights</h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Desktop</span>
                        <span>{detailedAnalytics.deviceBreakdown.desktop}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${detailedAnalytics.deviceBreakdown.desktop}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Mobile</span>
                        <span>{detailedAnalytics.deviceBreakdown.mobile}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${detailedAnalytics.deviceBreakdown.mobile}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tablet</span>
                        <span>{detailedAnalytics.deviceBreakdown.tablet}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-amber-500 h-2 rounded-full" 
                          style={{ width: `${detailedAnalytics.deviceBreakdown.tablet}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertDescription>
                    <div className="text-sm">
                      <p className="font-medium mb-1">Device Recommendations</p>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>{detailedAnalytics.deviceBreakdown.mobile > 30 ? "Prioritize mobile-first design for your emails" : "Continue optimizing for all devices"}</li>
                        <li>Ensure your CTAs are easily tappable on smaller screens</li>
                        <li>Keep email width under 600px for optimal display</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EnhancedEmailAnalytics;
