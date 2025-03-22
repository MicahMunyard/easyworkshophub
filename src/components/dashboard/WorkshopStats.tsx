
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WorkshopStats: React.FC = () => {
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
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Technician Efficiency</span>
            <span className="font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Job Completion Rate</span>
            <span className="font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Customer Satisfaction</span>
            <span className="font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Parts Availability</span>
            <span className="font-medium">0%</span>
          </div>
          <Progress value={0} className="h-2 bg-muted" indicatorClassName="bg-workshop-red" />
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkshopStats;
