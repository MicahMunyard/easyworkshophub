
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2, AlertCircle } from "lucide-react";
import { BookingType } from "@/types/booking";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import CustomerInfoFields from "./CustomerInfoFields";
import ServiceSelector from "./ServiceSelector";
import TechnicianSelector from "./TechnicianSelector";
import ServiceBaySelector from "./ServiceBaySelector";
import DateSelector from "./DateSelector";
import TimeStatusSelector from "./TimeStatusSelector";
import { useCustomerAPI } from "@/hooks/customers/useCustomerAPI";

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
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
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
  const { toast } = useToast();
  const { findCustomerByEmailOrPhone } = useCustomerAPI();
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  
  // Check if customer exists when phone number changes
  useEffect(() => {
    const checkExistingCustomer = async () => {
      if (booking.phone && booking.phone.length > 5) {
        setIsCheckingCustomer(true);
        const existingCustomer = await findCustomerByEmailOrPhone("", booking.phone);
        setIsReturningCustomer(!!existingCustomer);
        setIsCheckingCustomer(false);
        
        if (existingCustomer && !isEditing) {
          toast({
            title: "Returning Customer",
            description: `${existingCustomer.name} has booked with you ${existingCustomer.totalBookings} time(s) before.`,
          });
        }
      } else {
        setIsReturningCustomer(false);
      }
    };
    
    checkExistingCustomer();
  }, [booking.phone, findCustomerByEmailOrPhone, isEditing]);

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <CustomerInfoFields
          customer={booking.customer}
          phone={booking.phone}
          car={booking.car}
          handleChange={handleChange}
          isReturningCustomer={isReturningCustomer}
          isCheckingCustomer={isCheckingCustomer}
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

        <div className="grid gap-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={booking.notes || ""}
            onChange={handleChange}
            placeholder="Add notes about this booking"
            className="min-h-[100px]"
          />
        </div>
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
