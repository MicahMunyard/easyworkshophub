
import { useState } from "react";
import { JobType } from "@/types/job";

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

export const useJobForm = (initialJob: JobType = {...defaultJob}) => {
  const [job, setJob] = useState<JobType>({...initialJob});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setJob({...defaultJob});
  };

  const generateJobId = () => {
    return `JOB-${Math.floor(1000 + Math.random() * 9000)}`;
  };

  const getJobWithId = () => {
    return {
      ...job,
      id: generateJobId()
    };
  };

  return {
    job,
    setJob,
    handleChange,
    handleSelectChange,
    resetForm,
    getJobWithId
  };
};
