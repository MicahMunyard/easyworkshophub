
import React from "react";
import { Button } from "@/components/ui/button";
import { Timer, Check } from "lucide-react";
import { useTimeTracking } from "@/hooks/technician/useTimeTracking";

interface TimeTrackerProps {
  jobId: string;
  technicianId: string;
}

const TimeTracker: React.FC<TimeTrackerProps> = ({ jobId, technicianId }) => {
  const { isTimerRunning, startTimer, stopTimer } = useTimeTracking(jobId, technicianId);

  return (
    <Button
      onClick={isTimerRunning ? stopTimer : startTimer}
      variant={isTimerRunning ? "destructive" : "default"}
      className="gap-2"
    >
      {isTimerRunning ? (
        <>
          <Timer className="h-4 w-4 animate-pulse" />
          Stop Timer
        </>
      ) : (
        <>
          <Timer className="h-4 w-4" />
          Start Timer
        </>
      )}
    </Button>
  );
};

export default TimeTracker;
