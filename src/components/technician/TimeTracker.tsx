
import React from "react";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";
import { useTimeTracking } from "@/hooks/technician/useTimeTracking";

interface TimeTrackerProps {
  jobId: string;
  technicianId: string;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimeTracker: React.FC<TimeTrackerProps> = ({ jobId, technicianId }) => {
  const { isTimerRunning, startTimer, stopTimer, elapsedTime, totalTime } = useTimeTracking(jobId, technicianId);

  return (
    <div className="flex flex-col gap-2">
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
      
      {isTimerRunning && (
        <div className="text-center text-lg font-mono font-semibold">
          ⏱️ {formatTime(elapsedTime)}
        </div>
      )}
      
      {!isTimerRunning && totalTime > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Total: {formatTime(totalTime)}
        </div>
      )}
    </div>
  );
};

export default TimeTracker;
