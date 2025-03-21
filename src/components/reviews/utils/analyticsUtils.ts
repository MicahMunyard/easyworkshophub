
import { Review } from "../types";
import { startOfMonth, format, subMonths, isSameMonth } from "date-fns";

// Calculate average rating from reviews
export const calculateAverageRating = (reviews: Review[]): string => {
  return reviews.length 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";
};

// Calculate response rate as a percentage
export const calculateResponseRate = (reviews: Review[]): number => {
  return reviews.length > 0 
    ? Math.round((reviews.filter(r => r.response_text).length / reviews.length) * 100) 
    : 0;
};

// Get count of reviews by platform
export const getPlatformCounts = (reviews: Review[]): Record<string, number> => {
  return reviews.reduce((acc, review) => {
    acc[review.platform] = (acc[review.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

// Format platform data for charts
export const formatPlatformData = (platformCounts: Record<string, number>) => {
  return Object.entries(platformCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));
};

// Get count of reviews by rating
export const getRatingCounts = (reviews: Review[]): Record<number, number> => {
  return reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
};

// Format rating data for charts
export const formatRatingData = (ratingCounts: Record<number, number>) => {
  return [5, 4, 3, 2, 1].map(rating => ({
    rating: `${rating} Star${rating > 1 ? 's' : ''}`,
    count: ratingCounts[rating] || 0
  }));
};

// Get volume data over time
export const getVolumeData = (reviews: Review[], monthsCount: number = 6) => {
  const now = new Date();
  const months = Array.from({ length: monthsCount }, (_, i) => {
    const month = subMonths(now, i);
    return startOfMonth(month);
  }).reverse();

  return months.map(month => {
    const count = reviews.filter(review => 
      isSameMonth(new Date(review.review_date), month)
    ).length;

    return {
      month: format(month, 'MMM yyyy'),
      count
    };
  });
};

// Calculate percentages for tooltip displays safely
export const calculatePercentage = (value: number, total: number): string => {
  if (total === 0) return "0.0";
  return ((value / total) * 100).toFixed(1);
};

// Get most active platform info
export const getMostActivePlatform = (platformCounts: Record<string, number>): { name: string, count: number } => {
  if (Object.entries(platformCounts).length === 0) {
    return { name: "None", count: 0 };
  }
  
  const [name, count] = Object.entries(platformCounts)
    .sort((a, b) => b[1] - a[1])[0];
  
  return { name, count };
};

export const PLATFORM_COLORS = {
  google: '#4285F4',
  facebook: '#1877F2',
  yelp: '#D32323',
  other: '#6B7280'
};

export const RATING_COLORS = ['#22C55E', '#10B981', '#FBBF24', '#F59E0B', '#EF4444'];
