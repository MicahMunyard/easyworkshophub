
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobsData } from "@/hooks/jobs/useJobsData";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

const JobsStats = () => {
  const { jobs, isLoading } = useJobsData();
  
  // Count jobs by status
  const pendingCount = jobs.filter(job => job.status === 'pending').length;
  const inProgressCount = jobs.filter(job => ['inProgress', 'working'].includes(job.status)).length;
  const completedCount = jobs.filter(job => job.status === 'completed').length;

  return (
    <Card className="stats-card">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Job Stats</CardTitle>
        <CardDescription>Today's workshop overview</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-1">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-3xl font-bold">{isLoading ? '...' : pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-3xl font-bold">{isLoading ? '...' : inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="space-y-1 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-3xl font-bold">{isLoading ? '...' : completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobsStats;
