
import React from "react";
import { ReviewListProps } from "./types";
import ReviewItem from "./ReviewItem";
import { useToast } from "@/hooks/use-toast";

const ReviewList: React.FC<ReviewListProps> = ({ reviews, isLoading, onRespond }) => {
  const { toast } = useToast();

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

  const handleRespond = async (reviewId: string, responseText: string) => {
    try {
      await onRespond(reviewId, responseText);
      toast({
        title: "Response sent",
        description: "Your response has been saved and sent to the customer.",
      });
    } catch (error) {
      console.error("Error responding to review:", error);
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewItem key={review.id} review={review} onRespond={handleRespond} />
      ))}
    </div>
  );
};

export default ReviewList;
