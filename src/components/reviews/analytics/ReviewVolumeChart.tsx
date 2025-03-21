
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Review } from "../types";
import { getVolumeData } from "../utils/analyticsUtils";

interface ReviewVolumeChartProps {
  reviews: Review[];
}

const ReviewVolumeChart: React.FC<ReviewVolumeChartProps> = ({ reviews }) => {
  const volumeData = getVolumeData(reviews);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium mb-4">Review Volume Over Time</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={volumeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded p-2 shadow-md">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].value} reviews
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
                dataKey="count" 
                stroke="#0891B2" 
                activeDot={{ r: 8 }} 
                name="Review Count"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewVolumeChart;
