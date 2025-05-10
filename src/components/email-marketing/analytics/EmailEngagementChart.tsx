
import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { EmailAnalytic } from "../types";
import { prepareEngagementData, ChartData } from "../utils/analyticsUtils";

interface EmailEngagementChartProps {
  analytics: EmailAnalytic[];
}

const EmailEngagementChart: React.FC<EmailEngagementChartProps> = ({ analytics }) => {
  const engagementData: ChartData[] = prepareEngagementData(analytics);

  return (
    <div className="h-72">
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
    </div>
  );
};

export default EmailEngagementChart;
