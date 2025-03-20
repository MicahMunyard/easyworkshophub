
import React from "react";
import { ReviewListProps } from "./types";
import ReviewItem from "./ReviewItem";

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading, onRespond }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews found. Adjust your filters or check back later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} onRespond={onRespond} />
      ))}
    </div>
  );
};

export default ReviewList;
