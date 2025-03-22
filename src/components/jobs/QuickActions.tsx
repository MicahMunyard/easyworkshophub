
import React from "react";
import { Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QuickActions = () => {
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col gap-2">
        <Button variant="outline" className="justify-start w-full">
          <Plus className="h-4 w-4 mr-2" /> Create New Job
        </Button>
        <Button variant="outline" className="justify-start w-full">
          <Clock className="h-4 w-4 mr-2" /> View Job Schedule
        </Button>
        <Button variant="outline" className="justify-start w-full">
          <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Job Tasks
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
