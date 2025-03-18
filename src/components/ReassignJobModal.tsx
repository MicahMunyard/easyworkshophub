
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobType } from "@/types/job";
import { User, ArrowRight } from "lucide-react";

interface ReassignJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobType | null;
  onReassign: (job: JobType, newTechnician: string) => void;
}

const ReassignJobModal: React.FC<ReassignJobModalProps> = ({ isOpen, onClose, job, onReassign }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  if (!job) return null;

  const handleReassign = () => {
    if (selectedTechnician && job) {
      onReassign(job, selectedTechnician);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reassign Job</DialogTitle>
          <DialogDescription>
            Assign this job to a different technician.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <div className="mb-3 text-sm">
              <span className="font-medium">Job:</span> {job.id} - {job.service}
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4 text-muted-foreground" /> 
                <span className="text-sm">{job.assignedTo}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <Select 
                  value={selectedTechnician} 
                  onValueChange={setSelectedTechnician}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select new technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Mike Johnson", "Sarah Thomas", "Alex Rodriguez", "Lisa Chen"]
                      .filter(tech => tech !== job.assignedTo)
                      .map(tech => (
                        <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="bg-muted/40 p-3 rounded-md text-sm">
            <p className="font-medium mb-1">Job Information</p>
            <p className="text-muted-foreground">Customer: {job.customer}</p>
            <p className="text-muted-foreground">Vehicle: {job.vehicle}</p>
            <p className="text-muted-foreground">Date: {job.date}</p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReassign}
            disabled={!selectedTechnician}
          >
            Reassign Job
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReassignJobModal;
