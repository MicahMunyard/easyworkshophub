
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JobType } from "@/types/job";

interface JobFormProps {
  job: JobType;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const JobForm: React.FC<JobFormProps> = ({ job, handleChange, handleSelectChange }) => {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="customer">Customer Name</Label>
        <Input
          id="customer"
          name="customer"
          value={job.customer}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="vehicle">Vehicle</Label>
        <Input
          id="vehicle"
          name="vehicle"
          value={job.vehicle}
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
          value={job.service}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={job.status} 
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
            value={job.priority} 
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
          value={job.assignedTo} 
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
            value={job.date}
            onChange={handleChange}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            name="time"
            type="time"
            value={job.time || ''}
            onChange={handleChange}
            placeholder="Select time"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="timeEstimate">Time Estimate</Label>
        <Select 
          value={job.timeEstimate} 
          onValueChange={(value) => handleSelectChange("timeEstimate", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select estimate" />
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
  );
};

export default JobForm;
