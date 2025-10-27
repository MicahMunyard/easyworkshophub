
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkshopStats } from "@/hooks/dashboard/useWorkshopStats";

const WorkshopStats: React.FC = () => {
  const { user } = useAuth();
  const { data: stats, isLoading } = useWorkshopStats(user?.id);
  return (
    <Card className="w-full h-full overflow-hidden performance-card carbon-texture">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <div className="flex items-center">
          <Settings className="mr-2 h-5 w-5 text-workshop-red" />
          <div>
            <CardTitle>Workshop Stats</CardTitle>
            <CardDescription>Current performance metrics</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-sm text-muted-foreground">Loading stats...</div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Technician Efficiency</span>
                <span className="font-medium">{stats?.technicianEfficiency || 0}%</span>
              </div>
              <Progress value={stats?.technicianEfficiency || 0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Job Completion Rate</span>
                <span className="font-medium">{stats?.jobCompletionRate || 0}%</span>
              </div>
              <Progress value={stats?.jobCompletionRate || 0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Customer Satisfaction</span>
                <span className="font-medium">{stats?.customerSatisfaction || 0}%</span>
              </div>
              <Progress value={stats?.customerSatisfaction || 0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Parts Availability</span>
                <span className="font-medium">{stats?.partsAvailability || 0}%</span>
              </div>
              <Progress value={stats?.partsAvailability || 0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkshopStats;
