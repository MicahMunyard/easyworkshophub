
import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import EmailAnalytics from "./EmailAnalytics";
import type { EnhancedEmailAnalyticsProps } from "./types.d";

const EnhancedEmailAnalytics: React.FC<EnhancedEmailAnalyticsProps> = ({
  analytics,
  isLoading,
  exportAnalytics
}) => {
  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportAnalytics}
          disabled={isLoading || analytics.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>
      
      <EmailAnalytics analytics={analytics} isLoading={isLoading} />
    </div>
  );
};

export default EnhancedEmailAnalytics;
