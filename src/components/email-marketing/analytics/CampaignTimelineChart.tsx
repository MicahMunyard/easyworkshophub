
import React from "react";
import { 
  LineChart,
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import type { EmailAnalytic } from "../types";
import { prepareCampaignTimelineData, ChartData } from "../utils/analyticsUtils";

interface CampaignTimelineChartProps {
  analytics: EmailAnalytic[];
}

const CampaignTimelineChart: React.FC<CampaignTimelineChartProps> = ({ analytics }) => {
  const campaignTimelineData: ChartData[] = prepareCampaignTimelineData(analytics);

  return (
    <div className="h-80">
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
    </div>
  );
};

export default CampaignTimelineChart;
