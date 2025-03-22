
import React from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookingDiaryHeaderProps {
  onNewBookingClick: () => void;
  onFilterToggle: () => void;
  isFilterOpen: boolean;
}

const BookingDiaryHeader: React.FC<BookingDiaryHeaderProps> = ({
  onNewBookingClick,
  onFilterToggle,
  isFilterOpen
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Booking Diary</h1>
        <p className="text-muted-foreground">
          Manage appointments and schedule services
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
          onClick={onNewBookingClick}
        >
          <Plus className="h-4 w-4 mr-2" /> New Booking
        </Button>
      </div>
    </div>
  );
};

export default BookingDiaryHeader;
