
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TechnicianOfflineBannerProps {
  onRetry: () => void;
  isRetrying: boolean;
}

const TechnicianOfflineBanner: React.FC<TechnicianOfflineBannerProps> = ({ 
  onRetry, 
  isRetrying 
}) => {
  return (
    <div className="bg-yellow-600 text-white py-3 px-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between w-full">
          <p className="text-sm font-medium text-white">
            You're currently offline. Limited functionality available.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> 
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-1" /> 
                Try again
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianOfflineBanner;
