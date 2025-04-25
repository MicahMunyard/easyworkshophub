
import React from "react";
import { useTimesheets } from "@/hooks/timesheets/useTimesheets";
import TimeEntriesTable from "./TimeEntriesTable";
import TimesheetHeader from "./TimesheetHeader";
import ApprovalDialog from "./ApprovalDialog";

const TimesheetsPage = () => {
  const {
    timeEntries,
    isLoading,
    filters,
    setFilters,
    approveEntry,
    selectedEntry,
    setSelectedEntry,
  } = useTimesheets();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <TimesheetHeader filters={filters} onFiltersChange={setFilters} />
      
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
    </div>
  );
};

export default TimesheetsPage;
