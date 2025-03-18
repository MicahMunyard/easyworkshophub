
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobType } from "@/types/job";

interface EditJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobType | null;
  onSave: (job: JobType) => void;
}

const EditJobModal: React.FC<EditJobModalProps> = ({ isOpen, onClose, job, onSave }) => {
  const [editedJob, setEditedJob] = useState<JobType | null>(job);

  useEffect(() => {
    setEditedJob(job);
  }, [job]);

  if (!editedJob) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedJob((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setEditedJob((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedJob) {
      onSave(editedJob);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>
              Make changes to the job details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-2">
              <div className="font-medium">Job ID:</div>
              <div className="text-muted-foreground">{editedJob.id}</div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                name="customer"
                value={editedJob.customer}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input
                id="vehicle"
                name="vehicle"
                value={editedJob.vehicle}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="service">Service Required</Label>
              <Input
                id="service"
                name="service"
                value={editedJob.service}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={editedJob.status} 
                  onValueChange={(value) => handleSelectChange("status", value as "pending" | "inProgress" | "completed")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={editedJob.priority} 
                  onValueChange={(value) => handleSelectChange("priority", value as "Low" | "Medium" | "High")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="assignedTo">Assigned Technician</Label>
              <Select 
                value={editedJob.assignedTo} 
                onValueChange={(value) => handleSelectChange("assignedTo", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mike Johnson">Mike Johnson</SelectItem>
                  <SelectItem value="Sarah Thomas">Sarah Thomas</SelectItem>
                  <SelectItem value="Alex Rodriguez">Alex Rodriguez</SelectItem>
                  <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={editedJob.date}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timeEstimate">Time Estimate</Label>
                <Select 
                  value={editedJob.timeEstimate} 
                  onValueChange={(value) => handleSelectChange("timeEstimate", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30 mins">30 mins</SelectItem>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="2 hours">2 hours</SelectItem>
                    <SelectItem value="3 hours">3 hours</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="Full Day">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditJobModal;
