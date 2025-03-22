
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RecentActivitiesProps {
  user: any;
  isLoading: boolean;
  appointments: any[];
}

const RecentActivities: React.FC<RecentActivitiesProps> = ({ 
  user, 
  isLoading, 
  appointments 
}) => {
  const navigate = useNavigate();
  
  return (
    <Card className="col-span-12 md:col-span-8 performance-card">
      <CardHeader className="p-4 pb-2 border-b border-border/50">
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5 text-workshop-red" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {!user ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Sign in to view your recent activities</p>
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">Loading activities...</p>
            </div>
          ) : appointments.length > 0 ? (
            appointments.map((appointment, i) => (
              <div key={i} className="px-4 py-3 flex items-start gap-3 hover:bg-muted/40">
                <div className="h-8 w-8 rounded-full bg-workshop-red/10 flex items-center justify-center mt-0.5 text-workshop-red">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm">New appointment: {appointment.customer_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{new Date(appointment.created_at).toLocaleString()}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivities;
