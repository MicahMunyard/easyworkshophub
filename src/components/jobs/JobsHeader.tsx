
import React from "react";
import { Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobsHeaderProps {
  onNewJobClick: () => void;
  onFilterToggle: () => void;
  isFilterOpen: boolean;
}

const JobsHeader = ({ onNewJobClick, onFilterToggle, isFilterOpen }: JobsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Management</h1>
        <p className="text-muted-foreground">
          Track, assign and manage workshop jobs
        </p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="h-9"
          onClick={onFilterToggle}
        >
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
        <Button 
          className="h-9"
          onClick={onNewJobClick}
        >
          <Plus className="h-4 w-4 mr-2" /> New Job
        </Button>
      </div>
    </div>
  );
};

export default JobsHeader;
