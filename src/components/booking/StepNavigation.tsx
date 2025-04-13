
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface StepNavigationProps {
  step: "customer" | "workshop" | "scheduling";
  onPrevious?: () => void;
  onNext?: () => void;
  showBack?: boolean;
  showNext?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  step,
  onPrevious,
  onNext,
  showBack = true,
  showNext = true
}) => {
  // For the first step, don't show back button
  if (step === "customer" && !showBack) {
    return (
      <div className="flex justify-end mt-4">
        {showNext && (
          <Button type="button" onClick={onNext} className="gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }
  
  // For the last step, don't show next button
  if (step === "scheduling" && !showNext) {
    return (
      <div className="flex justify-between mt-4">
        {showBack && (
          <Button type="button" variant="outline" onClick={onPrevious} className="gap-1">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
        )}
      </div>
    );
  }

  // For middle steps, show both back and next
  return (
    <div className="flex justify-between mt-4">
      {showBack && (
        <Button type="button" variant="outline" onClick={onPrevious} className="gap-1">
          <ChevronLeft className="h-4 w-4" /> Back
        </Button>
      )}
      {showNext && (
        <Button type="button" onClick={onNext} className="gap-1">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default StepNavigation;
