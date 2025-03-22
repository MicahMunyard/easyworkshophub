
import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock } from "lucide-react";
import { BookingType } from "@/types/booking";

interface TimeStatusSelectorProps {
  time: string;
  status: BookingType["status"];
  onSelectChange: (name: string, value: string) => void;
}

const TimeStatusSelector: React.FC<TimeStatusSelectorProps> = ({
  time,
  status,
  onSelectChange,
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label htmlFor="time" className="flex items-center gap-2">
          <Clock className="h-4 w-4" /> Time
        </Label>
        <Select 
          value={time} 
          onValueChange={(value) => onSelectChange("time", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select time" />
          </SelectTrigger>
          <SelectContent>
            {["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
              "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
              "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
              "5:00 PM", "5:30 PM"].map((timeOption) => (
              <SelectItem key={timeOption} value={timeOption}>
                {timeOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="status" className="flex items-center gap-2">
          Status
        </Label>
        <Select 
          value={status} 
          onValueChange={(value) => onSelectChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TimeStatusSelector;
