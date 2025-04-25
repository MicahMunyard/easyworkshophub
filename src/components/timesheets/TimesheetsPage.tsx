
import React, { useState } from "react";
import { useTimesheets } from "@/hooks/timesheets/useTimesheets";
import TimeEntriesTable from "./TimeEntriesTable";
import TimesheetHeader from "./TimesheetHeader";
import ApprovalDialog from "./ApprovalDialog";
import { AddTimeEntryModal } from "./AddTimeEntryModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const TimesheetsPage = () => {
  const {
    timeEntries,
    isLoading,
    filters,
    setFilters,
    approveEntry,
    selectedEntry,
    setSelectedEntry,
    addTimeEntry,
  } = useTimesheets();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <TimesheetHeader filters={filters} onFiltersChange={setFilters} />
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>
      
      <TimeEntriesTable 
        entries={timeEntries}
        isLoading={isLoading}
        onApprove={(entry) => setSelectedEntry(entry)}
      />

      <ApprovalDialog 
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onApprove={approveEntry}
      />

      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={addTimeEntry}
      />
    </div>
  );
};

export default TimesheetsPage;
