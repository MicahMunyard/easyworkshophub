
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobType } from "@/types/job";

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobType) => void;
}

const defaultJob: JobType = {
  id: "",
  customer: "",
  vehicle: "",
  service: "",
  status: "pending",
  assignedTo: "",
  date: new Date().toISOString().split('T')[0],
  timeEstimate: "1 hour",
  priority: "Medium"
};

const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newJob, setNewJob] = useState<JobType>({...defaultJob});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate a job ID with format JOB-XXXX
    const jobId = `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const jobWithId = {
      ...newJob,
      id: jobId
    };
    
    onSave(jobWithId);
    setNewJob({...defaultJob}); // Reset form
  };

  const handleCloseModal = () => {
    setNewJob({...defaultJob}); // Reset form
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Job</DialogTitle>
            <DialogDescription>
              Enter the details for the new workshop job.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="customer">Customer Name</Label>
              <Input
                id="customer"
                name="customer"
                value={newJob.customer}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Input
                id="vehicle"
                name="vehicle"
                value={newJob.vehicle}
                onChange={handleChange}
                required
                placeholder="Year, Make, Model"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="service">Service Required</Label>
              <Input
                id="service"
                name="service"
                value={newJob.service}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={newJob.status} 
                  onValueChange={(value) => handleSelectChange("status", value as "pending" | "inProgress" | "completed" | "cancelled")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inProgress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={newJob.priority} 
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
                value={newJob.assignedTo} 
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
                  value={newJob.date}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="timeEstimate">Time Estimate</Label>
                <Select 
                  value={newJob.timeEstimate} 
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
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">Create Job</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewJobModal;
