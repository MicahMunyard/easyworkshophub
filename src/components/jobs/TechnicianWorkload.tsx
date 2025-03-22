
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TechnicianWorkload = () => {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Technician Workload</CardTitle>
        <CardDescription>Active jobs by technician</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Mike Johnson</span>
            <span>6 jobs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Sarah Thomas</span>
            <span>4 jobs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Alex Rodriguez</span>
            <span>5 jobs</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Lisa Chen</span>
            <span>3 jobs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicianWorkload;
