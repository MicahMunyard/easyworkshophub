
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface JobsHeaderProps {
  onNewJobClick: () => void;
  onFilterToggle: () => void;
  isFilterOpen: boolean;
}

const JobsHeader: React.FC<JobsHeaderProps> = ({
  onNewJobClick,
  onFilterToggle,
  isFilterOpen,
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
        <p className="text-muted-foreground">
          Manage and track all your workshop jobs
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onFilterToggle}
        >
          <Filter className="mr-2 h-4 w-4" />
          {isFilterOpen ? "Hide Filters" : "Show Filters"}
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/invoicing')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Invoicing
        </Button>
        
        <Button
          onClick={onNewJobClick}
          className="bg-workshop-red hover:bg-workshop-red/90"
        >
          <Plus className="mr-2 h-4 w-4" /> New Job
        </Button>
      </div>
    </div>
  );
};

export default JobsHeader;
