
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Review } from "../types";
import { getRatingCounts, formatRatingData } from "../utils/analyticsUtils";

interface RatingDistributionChartProps {
  reviews: Review[];
}

const RatingDistributionChart: React.FC<RatingDistributionChartProps> = ({ reviews }) => {
  const ratingCounts = getRatingCounts(reviews);
  const ratingData = formatRatingData(ratingCounts);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium mb-4">Rating Distribution</div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ratingData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="rating" type="category" width={80} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border border-border rounded p-2 shadow-md">
                        <p className="font-medium">{payload[0].payload.rating}</p>
                        <p className="text-sm text-muted-foreground">
                          {payload[0].value} reviews
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="count" 
                fill="#22C55E" 
                name="Number of Reviews" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RatingDistributionChart;
