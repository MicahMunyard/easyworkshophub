
import React, { useState } from "react";
import { 
  Card
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useJobs } from "@/hooks/useJobs";

// Importing the components
import JobsHeader from "./JobsHeader";
import JobsFilter from "./JobsFilter";
import JobsTable from "./JobsTable";
import JobsStats from "./JobsStats";
import QuickActions from "./QuickActions";
import NewJobModal from "./modals/NewJobModal";
import JobDetailsModal from "./modals/JobDetailsModal";
import EditJobModal from "./modals/EditJobModal";
import ReassignJobModal from "./modals/ReassignJobModal";
import CancelJobDialog from "./modals/CancelJobDialog";
import { PendingPartsRequests } from "@/components/admin/PendingPartsRequests";

const JobsPage = () => {
  const {
    isLoading,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    selectedJob,
    setSelectedJob,
    filteredJobs,
    addJob,
    updateJob,
    reassignJob,
    cancelJob
  } = useJobs();

  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleViewDetails = (job: typeof selectedJob) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(true);
  };

  const handleEditJob = (job: typeof selectedJob) => {
    setSelectedJob(job);
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleReassignJob = (job: typeof selectedJob) => {
    setSelectedJob(job);
    setIsReassignModalOpen(true);
  };

  const handleCancelJobClick = (job: typeof selectedJob) => {
    setSelectedJob(job);
    setIsCancelDialogOpen(true);
  };

  const handleAddNewJob = async (newJob: any) => {
    const success = await addJob(newJob);
    if (success) {
      setIsNewJobModalOpen(false);
    }
  };

  const handleUpdateJob = async (updatedJob: any) => {
    const success = await updateJob(updatedJob);
    if (success) {
      setIsEditModalOpen(false);
    }
  };

  const handleReassignConfirm = async (job: any, newTechnician: string) => {
    const success = await reassignJob(job, newTechnician);
    if (success) {
      setIsReassignModalOpen(false);
    }
  };

  const handleCancelJobConfirm = async () => {
    if (selectedJob) {
      const success = await cancelJob(selectedJob);
      if (success) {
        setIsCancelDialogOpen(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <JobsHeader 
        onNewJobClick={() => setIsNewJobModalOpen(true)}
        onFilterToggle={() => setIsFilterOpen(!isFilterOpen)}
        isFilterOpen={isFilterOpen}
      />

      {isFilterOpen && (
        <JobsFilter 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
        />
      )}

      <Tabs defaultValue="jobs" className="space-y-6">
        <TabsList>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="parts-requests">Parts Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Card className="w-full">
              <JobsTable 
                filteredJobs={filteredJobs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                isLoading={isLoading}
                onViewDetails={handleViewDetails}
                onEditJob={handleEditJob}
                onReassignJob={handleReassignJob}
                onCancelJob={handleCancelJobClick}
              />
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <JobsStats />
            <div className="col-span-2">
              <QuickActions onNewJobClick={() => setIsNewJobModalOpen(true)} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="parts-requests">
          <PendingPartsRequests />
        </TabsContent>
      </Tabs>

      <NewJobModal
        isOpen={isNewJobModalOpen}
        onClose={() => setIsNewJobModalOpen(false)}
        onSave={handleAddNewJob}
      />

      <JobDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        job={selectedJob}
        onEdit={handleEditJob}
      />

      <EditJobModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        job={selectedJob}
        onSave={handleUpdateJob}
      />

      <ReassignJobModal
        isOpen={isReassignModalOpen}
        onClose={() => setIsReassignModalOpen(false)}
        job={selectedJob}
        onReassign={handleReassignConfirm}
      />

      <CancelJobDialog
        isOpen={isCancelDialogOpen}
        onClose={() => setIsCancelDialogOpen(false)}
        job={selectedJob}
        onConfirm={handleCancelJobConfirm}
      />
    </div>
  );
};

export default JobsPage;
