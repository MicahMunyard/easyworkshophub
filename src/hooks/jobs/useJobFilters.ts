
import { useState } from "react";
import { JobType } from "@/types/job";

export const useJobFilters = (jobs: JobType[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const getFilteredJobs = () => {
    return jobs.filter(job => {
      const matchesSearch = 
        job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.assignedTo.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeTab === "all") return matchesSearch;
      if (activeTab === "active") return matchesSearch && (job.status === "pending" || job.status === "inProgress");
      if (activeTab === "completed") return matchesSearch && job.status === "completed";
      
      return matchesSearch;
    });
  };

  return {
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    filteredJobs: getFilteredJobs()
  };
};
