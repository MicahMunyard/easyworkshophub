
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Review } from "../types";
import { 
  getPlatformCounts, 
  formatPlatformData, 
  calculatePercentage,
  PLATFORM_COLORS
} from "../utils/analyticsUtils";

interface PlatformDistributionChartProps {
  reviews: Review[];
}

const PlatformDistributionChart: React.FC<PlatformDistributionChartProps> = ({ reviews }) => {
  const platformCounts = getPlatformCounts(reviews);
  const platformData = formatPlatformData(platformCounts);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium mb-4">Platform Distribution</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(Number(percent) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {platformData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PLATFORM_COLORS[entry.name.toLowerCase() as keyof typeof PLATFORM_COLORS] || '#6B7280'} 
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const total = reviews.length;
                    const value = Number(payload[0].value);
                    const percentage = calculatePercentage(value, total);
                    
                    return (
                      <div className="bg-background border border-border rounded p-2 shadow-md">
                        <p className="font-medium">{payload[0].name}</p>
                        <p className="text-sm text-muted-foreground">
                          {value} reviews ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformDistributionChart;
