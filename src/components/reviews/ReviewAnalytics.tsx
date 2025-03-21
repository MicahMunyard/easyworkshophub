
import React from "react";
import { ReviewAnalyticsProps } from "./types";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";
import { startOfMonth, format, subMonths, isSameMonth } from "date-fns";

const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({ reviews, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-8">No review data available.</div>;
  }

  const averageRating = reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const platformCounts = reviews.reduce((acc, review) => {
    acc[review.platform] = (acc[review.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const ratingData = [5, 4, 3, 2, 1].map(rating => ({
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: ratingCounts[rating] || 0
  }));

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const month = subMonths(now, i);
    return startOfMonth(month);
  }).reverse();

  const volumeData = months.map(month => {
    const count = reviews.filter(review => 
      isSameMonth(new Date(review.review_date), month)
    ).length;

    return {
      month: format(month, 'MMM yyyy'),
      count
    };
  });

  const PLATFORM_COLORS = {
    google: '#4285F4',
    facebook: '#1877F2',
    yelp: '#D32323',
    other: '#6B7280'
  };

  const RATING_COLORS = ['#22C55E', '#10B981', '#FBBF24', '#F59E0B', '#EF4444'];

  // Calculate the response rate as a number
  const responseRate = reviews.length > 0 
    ? Math.round((reviews.filter(r => r.response_text).length / reviews.length) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Overall Rating</div>
            <div className="flex items-center">
              <span className="text-3xl font-bold">{averageRating}</span>
              <div className="flex ml-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(Number(averageRating)) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-1">Based on {reviews.length} reviews</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Response Rate</div>
            <div className="text-3xl font-bold">
              {responseRate}%
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {reviews.filter(r => r.response_text).length} of {reviews.length} reviews responded to
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-sm font-medium text-muted-foreground mb-2">Most Active Platform</div>
            <div className="text-3xl font-bold capitalize">
              {Object.entries(platformCounts).length
                ? Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0][0]
                : "None"
              }
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {Object.entries(platformCounts).length
                ? `${Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0][1]} reviews`
                : "No platforms data"
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                        return (
                          <div className="bg-background border border-border rounded p-2 shadow-md">
                            <p className="font-medium">{payload[0].name}</p>
                            <p className="text-sm text-muted-foreground">
                              {payload[0].value} reviews ({((payload[0].value / reviews.length) * 100).toFixed(1)}%)
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
      </div>

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
    </div>
  );
};

export default ReviewAnalytics;
