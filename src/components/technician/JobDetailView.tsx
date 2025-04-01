
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Timer, 
  CheckCircle2, 
  Camera, 
  ShoppingBag,
  MessageCircle,
  FileText,
  Clock,
  Car,
  User,
  Calendar,
  AlertTriangle
} from "lucide-react";
import { TechnicianJob, JobStatus, PartRequest } from "@/types/technician";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import JobPhotosSection from "@/components/technician/JobPhotosSection";
import PartsRequestSection from "@/components/technician/PartsRequestSection";

interface JobDetailViewProps {
  job: TechnicianJob;
  isTimerRunning: boolean;
  onBack: () => void;
  onUpdateStatus: (jobId: string, status: JobStatus) => void;
  onToggleTimer: (jobId: string) => void;
  onUploadPhoto: (jobId: string, file: File) => void;
  onRequestParts: (jobId: string, parts: { name: string, quantity: number }[]) => void;
}

const JobDetailView: React.FC<JobDetailViewProps> = ({
  job,
  isTimerRunning,
  onBack,
  onUpdateStatus,
  onToggleTimer,
  onUploadPhoto,
  onRequestParts
}) => {
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  
  const handleComplete = () => {
    onUpdateStatus(job.id, 'completed');
    setIsCompleteDialogOpen(false);
    toast({
      title: "Job completed",
      description: "The job has been marked as complete.",
    });
  };
  
  const getNextStepButton = () => {
    switch (job.status) {
      case 'pending':
        return (
          <Button 
            className="gap-2"
            onClick={() => onUpdateStatus(job.id, 'accepted')}
          >
            <CheckCircle2 className="h-4 w-4" />
            Accept Job
          </Button>
        );
      case 'accepted':
        return (
          <Button 
            className="gap-2"
            onClick={() => onUpdateStatus(job.id, 'inProgress')}
          >
            <Timer className="h-4 w-4" />
            Start Work
          </Button>
        );
      case 'inProgress':
      case 'working':
        return (
          <Button 
            className="gap-2"
            onClick={() => setIsCompleteDialogOpen(true)}
          >
            <CheckCircle2 className="h-4 w-4" />
            Complete Job
          </Button>
        );
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'inProgress':
      case 'working':
        return <Badge variant="outline" className="bg-indigo-100 text-indigo-800">In Progress</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Cancelled</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="p-0 h-auto gap-1"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to jobs
          </Button>
          {(job.status === 'inProgress' || job.status === 'working') && (
            <Button 
              variant={isTimerRunning ? "default" : "outline"}
              className={`gap-1 ${isTimerRunning ? "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200" : ""}`}
              onClick={() => onToggleTimer(job.id)}
            >
              <Timer className={`h-4 w-4 ${isTimerRunning ? "animate-pulse" : ""}`} />
              {isTimerRunning ? "Stop Timer" : "Start Timer"}
            </Button>
          )}
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Job #{job.id}</p>
              </div>
              {getStatusBadge(job.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-3.5 w-3.5" /> Customer
                </div>
                <div className="font-medium">{job.customer}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Car className="h-3.5 w-3.5" /> Vehicle
                </div>
                <div className="font-medium">{job.vehicle}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> Scheduled
                </div>
                <div className="font-medium">{job.scheduledFor || 'Not scheduled'}</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Estimated Time
                </div>
                <div className="font-medium">{job.estimatedTime || 'Not specified'}</div>
              </div>
            </div>
            
            {job.description && (
              <div className="mt-4">
                <div className="text-sm text-muted-foreground mb-1">Description</div>
                <p>{job.description}</p>
              </div>
            )}
            
            {job.status !== 'completed' && job.status !== 'cancelled' && job.status !== 'declined' && (
              <div className="mt-6 flex justify-end">
                {getNextStepButton()}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="photos" className="text-xs sm:text-sm">
              Photos
            </TabsTrigger>
            <TabsTrigger value="parts" className="text-xs sm:text-sm">
              Parts
            </TabsTrigger>
            <TabsTrigger value="notes" className="text-xs sm:text-sm">
              Notes
            </TabsTrigger>
            <TabsTrigger value="messages" className="text-xs sm:text-sm">
              Messages
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photos" className="mt-4">
            <JobPhotosSection 
              jobId={job.id} 
              photos={job.photos}
              onUploadPhoto={onUploadPhoto}
            />
          </TabsContent>
          
          <TabsContent value="parts" className="mt-4">
            <PartsRequestSection
              jobId={job.id}
              parts={job.partsRequested}
              onRequestParts={onRequestParts}
            />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Job Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {job.notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No notes for this job</p>
                ) : (
                  <div className="space-y-4">
                    {job.notes.map(note => (
                      <div key={note.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium">{note.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-1">{note.content}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-4">
                  <Label htmlFor="add-note">Add Note</Label>
                  <Textarea id="add-note" placeholder="Type your note here..." className="mt-1" />
                  <Button className="mt-2">Add Note</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="messages" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Customer Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-6">
                  No messages for this job yet
                </p>
                
                <div className="mt-4">
                  <Label htmlFor="message">Send Message to Customer</Label>
                  <Textarea id="message" placeholder="Type your message here..." className="mt-1" />
                  <Button className="mt-2 gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Complete Job Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Complete Job</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="complete-notes">Completion Notes</Label>
            <Textarea 
              id="complete-notes" 
              placeholder="Add any notes about the completed work..."
              className="mt-1"
              value={completeNotes}
              onChange={(e) => setCompleteNotes(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplete}>
              Complete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobDetailView;
