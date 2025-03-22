
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobType } from "@/types/job";
import JobForm from "./forms/JobForm";
import { useJobForm } from "./forms/useJobForm";

interface NewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobType) => void;
}

const NewJobModal: React.FC<NewJobModalProps> = ({ isOpen, onClose, onSave }) => {
  const { job, handleChange, handleSelectChange, resetForm, getJobWithId } = useJobForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const jobWithId = getJobWithId();
    onSave(jobWithId);
    resetForm();
  };

  const handleCloseModal = () => {
    resetForm();
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
          
          <JobForm 
            job={job} 
            handleChange={handleChange} 
            handleSelectChange={handleSelectChange} 
          />
          
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
