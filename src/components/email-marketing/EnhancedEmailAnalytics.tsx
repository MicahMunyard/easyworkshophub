import React from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { EmailAnalytic } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface EnhancedEmailAnalyticsProps {
  analytics: EmailAnalytic[];
  isLoading: boolean;
  exportAnalytics?: (format: 'csv' | 'pdf') => Promise<void>;
}

const EnhancedEmailAnalytics: React.FC<EnhancedEmailAnalyticsProps> = ({ 
  analytics, 
  isLoading,
  exportAnalytics
}) => {
  // Mock function to calculate Click-to-Open Rate (CTOR)
  const calculateCTOR = (openCount: number, clickCount: number): number => {
    if (openCount === 0) return 0;
    return (clickCount / openCount) * 100;
  };

  // Transform analytics data for the chart
  const chartData = analytics.map(item => ({
    name: item.campaign_name,
    "Open Rate": (item.open_count / item.sent_count) * 100,
    "Click Rate": (item.click_count / item.sent_count) * 100,
    "CTOR": calculateCTOR(item.open_count, item.click_count),
  }));

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded p-2 shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            Open Rate: {typeof payload[0].value === 'number' ? payload[0].value.toFixed(1) : payload[0].value}%
          </p>
          <p className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            Click Rate: {typeof payload[1].value === 'number' ? payload[1].value.toFixed(1) : payload[1].value}%
          </p>
          <p className="text-sm flex items-center">
            <span className="w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            CTOR: {typeof payload[2].value === 'number' ? payload[2].value.toFixed(1) : payload[2].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => exportAnalytics && exportAnalytics('csv')}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => exportAnalytics && exportAnalytics('pdf')}
          disabled={isLoading}
        >
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance Metrics</CardTitle>
          <CardDescription>
            Track email campaign performance over time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => value + "%"} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="Open Rate" fill="#3b82f6" />
                <Bar dataKey="Click Rate" fill="#16a34a" />
                <Bar dataKey="CTOR" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedEmailAnalytics;
