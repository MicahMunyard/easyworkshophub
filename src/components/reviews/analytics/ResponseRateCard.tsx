
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Review } from "../types";
import { calculateResponseRate } from "../utils/analyticsUtils";

interface ResponseRateCardProps {
  reviews: Review[];
}

const ResponseRateCard: React.FC<ResponseRateCardProps> = ({ reviews }) => {
  const responseRate = calculateResponseRate(reviews);

  return (
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
  );
};

export default ResponseRateCard;
