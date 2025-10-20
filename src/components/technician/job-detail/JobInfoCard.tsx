
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TechnicianJob, JobStatus } from "@/types/technician";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Calendar, Clock, User, CheckCircle, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface JobInfoCardProps {
  job: TechnicianJob;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const JobInfoCard: React.FC<JobInfoCardProps> = ({ job, onUpdateStatus }) => {
  const canComplete = job.status === 'inProgress' || job.status === 'working';
  const [totalTimeLogged, setTotalTimeLogged] = useState<number>(0);
  const { user } = useAuth();

  useEffect(() => {
    const fetchTotalTime = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('time_entries')
        .select('duration')
        .eq('job_id', job.id)
        .eq('user_id', user.id)
        .not('duration', 'is', null);

      if (data) {
        const total = data.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        setTotalTimeLogged(total);
      }
    };

    fetchTotalTime();
  }, [job.id, user]);
  
  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold">{job.title}</h2>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          <Badge variant="outline" className="text-sm">
            {job.status === 'inProgress' || job.status === 'working' ? 'In Progress' : job.status}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span>{job.vehicle}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{job.customer}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{job.scheduledFor ? new Date(job.scheduledFor).toLocaleDateString() : 'Not scheduled'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{job.estimatedTime || 'Not specified'}</span>
          </div>
        </div>

        {totalTimeLogged > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total Time Logged:</span>
            <Badge variant="secondary">{formatDuration(totalTimeLogged)}</Badge>
          </div>
        )}
        
        {canComplete && (
          <Button 
            className="w-full" 
            variant="default"
            onClick={() => onUpdateStatus(job.id, 'completed')}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Complete
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default JobInfoCard;
