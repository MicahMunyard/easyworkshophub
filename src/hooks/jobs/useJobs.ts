
import { useState } from "react";
import { JobType } from "@/types/job";
import { useJobsData } from "./useJobsData";
import { useJobMutations } from "./useJobMutations";
import { useJobFilters } from "./useJobFilters";

export const useJobs = () => {
  const { jobs, isLoading, fetchJobs } = useJobsData();
  const { addJob, updateJob, reassignJob, cancelJob } = useJobMutations(fetchJobs);
  const { searchTerm, setSearchTerm, activeTab, setActiveTab, filteredJobs } = useJobFilters(jobs);
  const [selectedJob, setSelectedJob] = useState<JobType | null>(null);

  return {
    jobs,
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedJob,
    setSelectedJob,
    filteredJobs,
    fetchJobs,
    addJob,
    updateJob,
    reassignJob,
    cancelJob
  };
};
