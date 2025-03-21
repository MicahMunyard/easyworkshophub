
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Review } from "../types";
import { getPlatformCounts, getMostActivePlatform } from "../utils/analyticsUtils";

interface PlatformCardProps {
  reviews: Review[];
}

const PlatformCard: React.FC<PlatformCardProps> = ({ reviews }) => {
  const platformCounts = getPlatformCounts(reviews);
  const { name, count } = getMostActivePlatform(platformCounts);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-sm font-medium text-muted-foreground mb-2">Most Active Platform</div>
        <div className="text-3xl font-bold capitalize">
          {name}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {count > 0 ? `${count} reviews` : "No platforms data"}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlatformCard;
