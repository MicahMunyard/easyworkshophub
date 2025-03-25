
import React from "react";
import { Plus, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface QuickActionsProps {
  onNewJobClick: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onNewJobClick }) => {
  const navigate = useNavigate();
  
  return (
    <Card>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-base">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex flex-col gap-2">
        <Button variant="outline" className="justify-start w-full" onClick={onNewJobClick}>
          <Plus className="h-4 w-4 mr-2" /> Create New Job
        </Button>
        <Button variant="outline" className="justify-start w-full" onClick={() => navigate('/booking-diary')}>
          <Clock className="h-4 w-4 mr-2" /> View Job Schedule
        </Button>
        <Button 
          variant="outline" 
          className="justify-start w-full" 
          onClick={() => navigate('/jobs?tab=in-progress')}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" /> Complete Job Tasks
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
