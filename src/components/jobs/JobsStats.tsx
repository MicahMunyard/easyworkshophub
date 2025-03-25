
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobsData } from "@/hooks/jobs/useJobsData";

const JobsStats = () => {
  const { jobs, isLoading } = useJobsData();
  
  // Count jobs by status
  const pendingCount = jobs.filter(job => job.status === 'pending').length;
  const inProgressCount = jobs.filter(job => ['inProgress', 'working'].includes(job.status)).length;
  const completedCount = jobs.filter(job => job.status === 'completed').length;

  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Job Stats</CardTitle>
        <CardDescription>Today's workshop overview</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <div className="text-3xl font-bold">{isLoading ? '...' : pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold">{isLoading ? '...' : inProgressCount}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-bold">{isLoading ? '...' : completedCount}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default JobsStats;
