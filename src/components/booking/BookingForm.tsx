
import React from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { BookingType } from "@/types/booking";
import CustomerInfoFields from "./CustomerInfoFields";
import ServiceSelector from "./ServiceSelector";
import TechnicianSelector from "./TechnicianSelector";
import ServiceBaySelector from "./ServiceBaySelector";
import DateSelector from "./DateSelector";
import TimeStatusSelector from "./TimeStatusSelector";

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface TechnicianOption {
  id: string;
  name: string;
}

interface BayOption {
  id: string;
  name: string;
}

interface BookingFormProps {
  booking: BookingType;
  date: Date | undefined;
  services: ServiceOption[];
  technicians: TechnicianOption[];
  bays: BayOption[];
  selectedServiceId: string | null;
  selectedTechnicianId: string | null;
  selectedBayId: string | null;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleDateChange: (newDate: Date | undefined) => void;
  handleSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isEditing: boolean;
  onDeleteClick?: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  booking,
  date,
  services,
  technicians,
  bays,
  selectedServiceId,
  selectedTechnicianId,
  selectedBayId,
  handleChange,
  handleSelectChange,
  handleDateChange,
  handleSubmit,
  onClose,
  isEditing,
  onDeleteClick
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <CustomerInfoFields
          customer={booking.customer}
          phone={booking.phone}
          car={booking.car}
          handleChange={handleChange}
        />
        
        <ServiceSelector
          selectedServiceId={selectedServiceId}
          services={services}
          onServiceChange={(value) => handleSelectChange("serviceId", value)}
        />
        
        <TechnicianSelector
          selectedTechnicianId={selectedTechnicianId}
          technicians={technicians}
          onTechnicianChange={(value) => handleSelectChange("technicianId", value)}
        />
        
        <ServiceBaySelector
          selectedBayId={selectedBayId}
          bays={bays}
          onBayChange={(value) => handleSelectChange("bayId", value)}
        />
        
        <DateSelector
          date={date}
          onDateChange={handleDateChange}
        />
        
        <TimeStatusSelector
          time={booking.time}
          status={booking.status}
          onSelectChange={handleSelectChange}
        />
      </div>
      <DialogFooter className="flex justify-between">
        {isEditing && onDeleteClick && (
          <div>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={onDeleteClick}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>
        )}
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Save Changes" : "Save Booking"}
          </Button>
        </div>
      </DialogFooter>
    </form>
  );
};

export default BookingForm;
