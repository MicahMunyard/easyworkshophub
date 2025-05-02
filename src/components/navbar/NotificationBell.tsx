
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useJobs } from "@/hooks/jobs/useJobs";

const NotificationBell = () => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useNotifications();
  const navigate = useNavigate();
  const { updateJob } = useJobs();
  const [isRebookDialogOpen, setIsRebookDialogOpen] = useState(false);
  const [finishedJobData, setFinishedJobData] = useState<any>(null);

  const handleNotificationClick = async (notification: any) => {
    markAsRead(notification.id);
    
    if (notification.type === "job_completed" && notification.actionData?.jobId) {
      // Handle completed job notification
      const job = notification.actionData;
      
      if (job) {
        // Mark the job as finished
        const updatedJob = {
          ...job,
          status: "finished"
        };
        
        const success = await updateJob(updatedJob);
        if (success) {
          // Show rebooking dialog
          setFinishedJobData(job);
          setIsRebookDialogOpen(true);
        }
      }
    }
  };

  const handleRebookYes = () => {
    setIsRebookDialogOpen(false);
    
    // Calculate date 6 months from now
    const currentDate = new Date();
    const sixMonthsLater = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 6,
      currentDate.getDate()
    );
    
    // Navigate to booking diary with date parameter
    navigate(`/booking-diary?date=${sixMonthsLater.toISOString().split('T')[0]}`);
  };

  const handleRebookNo = () => {
    setIsRebookDialogOpen(false);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2">
                <span className="absolute top-0 right-0 -mr-1 -mt-1 text-xs bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h4 className="text-sm font-medium">Notifications</h4>
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground"
              >
                Mark all as read
              </Button>
            )}
          </div>
          
          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
                No notifications
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`p-4 cursor-pointer hover:bg-accent ${
                      !notification.read ? "bg-accent/30" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex justify-between items-start">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <span className="text-xs text-muted-foreground">
                        {format(notification.createdAt, "HH:mm")}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {/* Rebooking Dialog */}
      <Dialog open={isRebookDialogOpen} onOpenChange={setIsRebookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Follow-up Service</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Would you like to schedule a follow-up service for this customer in 6 months?</p>
            {finishedJobData && (
              <div className="mt-4 p-3 bg-accent rounded-md">
                <p><strong>Customer:</strong> {finishedJobData.customer}</p>
                <p><strong>Vehicle:</strong> {finishedJobData.vehicle}</p>
                <p><strong>Service:</strong> {finishedJobData.service}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleRebookNo}>No</Button>
            <Button onClick={handleRebookYes}>Yes, Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NotificationBell;
