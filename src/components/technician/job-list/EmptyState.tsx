
import React from "react";
import { AlertTriangle } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
      <p className="text-muted-foreground">No jobs found in this category</p>
      <p className="text-xs text-muted-foreground mt-2">
        Check your connection or try refreshing the page
      </p>
    </div>
  );
};

export default EmptyState;
