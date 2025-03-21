
import React from "react";
import { ReviewAnalyticsProps } from "./types";
import OverallRatingCard from "./analytics/OverallRatingCard";
import ResponseRateCard from "./analytics/ResponseRateCard";
import PlatformCard from "./analytics/PlatformCard";
import RatingDistributionChart from "./analytics/RatingDistributionChart";
import PlatformDistributionChart from "./analytics/PlatformDistributionChart";
import ReviewVolumeChart from "./analytics/ReviewVolumeChart";

const ReviewAnalytics: React.FC<ReviewAnalyticsProps> = ({ reviews, isLoading }) => {
  if (isLoading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-8">No review data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverallRatingCard reviews={reviews} />
        <ResponseRateCard reviews={reviews} />
        <PlatformCard reviews={reviews} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RatingDistributionChart reviews={reviews} />
        <PlatformDistributionChart reviews={reviews} />
      </div>

      <ReviewVolumeChart reviews={reviews} />
    </div>
  );
};

export default ReviewAnalytics;
