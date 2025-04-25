
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TimesheetFilters } from "@/hooks/timesheets/useTimesheets";

interface TimesheetHeaderProps {
  filters: TimesheetFilters;
  onFiltersChange: (filters: TimesheetFilters) => void;
}

const TimesheetHeader: React.FC<TimesheetHeaderProps> = ({
  filters,
  onFiltersChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Timesheets</h1>
        <Button variant="outline" onClick={() => onFiltersChange({})}>
          Reset Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Start Date</Label>
          <Input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, startDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>End Date</Label>
          <Input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, endDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Technician</Label>
          <Input
            type="text"
            placeholder="Filter by technician..."
            value={filters.technicianId || ''}
            onChange={(e) =>
              onFiltersChange({ ...filters, technicianId: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default TimesheetHeader;
