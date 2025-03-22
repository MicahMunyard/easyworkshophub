
import React from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface JobsFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const JobsFilter = ({ searchTerm, setSearchTerm }: JobsFilterProps) => {
  return (
    <div className="bg-muted/30 p-4 rounded-md border animate-fadeIn">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search jobs by ID, customer, vehicle, service..."
          className="flex-1 bg-transparent border-none outline-none text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={() => setSearchTerm("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default JobsFilter;
