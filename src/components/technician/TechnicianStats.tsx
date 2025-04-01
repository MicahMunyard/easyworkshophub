
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle2, AlertTriangle, Timer } from "lucide-react";

interface TechnicianStatsProps {
  pendingCount: number;
  activeCount: number;
  completedCount: number;
  activeJobTimer: boolean;
}

const TechnicianStats: React.FC<TechnicianStatsProps> = ({
  pendingCount,
  activeCount,
  completedCount,
  activeJobTimer
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`bg-amber-100 dark:bg-amber-900 p-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-amber-900 dark:text-amber-100">Pending</h3>
              <Clock className="h-5 w-5 text-amber-900 dark:text-amber-100" />
            </div>
            <p className="text-2xl font-bold mt-2 text-amber-900 dark:text-amber-100">{pendingCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className={`${activeJobTimer ? 'bg-blue-200 dark:bg-blue-900 animate-pulse' : 'bg-blue-100 dark:bg-blue-900'} p-4`}>
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Active</h3>
              {activeJobTimer ? (
                <Timer className="h-5 w-5 text-blue-900 dark:text-blue-100" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-blue-900 dark:text-blue-100" />
              )}
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-900 dark:text-blue-100">{activeCount}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-green-100 dark:bg-green-900 p-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-green-900 dark:text-green-100">Completed</h3>
              <CheckCircle2 className="h-5 w-5 text-green-900 dark:text-green-100" />
            </div>
            <p className="text-2xl font-bold mt-2 text-green-900 dark:text-green-100">{completedCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicianStats;
