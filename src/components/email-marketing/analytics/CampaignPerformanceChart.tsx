
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { EmailAnalytic } from "../types";
import { prepareCampaignPerformanceData } from "../utils/analyticsUtils";

interface CampaignPerformanceChartProps {
  analytics: EmailAnalytic[];
}

const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({ analytics }) => {
  const campaignPerformanceData = prepareCampaignPerformanceData(analytics);

  return (
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
  );
};

export default CampaignPerformanceChart;
