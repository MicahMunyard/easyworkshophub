
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Trash2, ChevronRight, ChevronLeft } from "lucide-react";
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

type FormStep = "customer" | "workshop" | "scheduling";

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
  const [returnNotified, setReturnNotified] = useState(false);
  const [currentStep, setCurrentStep] = useState<FormStep>("customer");
  const lastCheckedInfo = useRef({ phone: '', email: '' });
  
  // Navigate to next step
  const goToNextStep = () => {
    if (currentStep === "customer") {
      if (!booking.customer || !booking.phone || !booking.car) {
        toast({
          title: "Missing information",
          description: "Please fill in all required customer information.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("workshop");
    } else if (currentStep === "workshop") {
      if (!booking.service) {
        toast({
          title: "Missing information",
          description: "Please select a service.",
          variant: "destructive"
        });
        return;
      }
      setCurrentStep("scheduling");
    }
  };

  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStep === "scheduling") {
      setCurrentStep("workshop");
    } else if (currentStep === "workshop") {
      setCurrentStep("customer");
    }
  };
  
  // Check if customer exists when customer info changes
  useEffect(() => {
    // Don't trigger customer check if the form is being edited
    if (isEditing) return;
    
    // Only check if we have sufficient customer info AND it's different from last check
    if ((booking.phone && booking.phone.length > 5 && booking.phone !== lastCheckedInfo.current.phone) || 
        (booking.email && booking.email.length > 5 && booking.email !== lastCheckedInfo.current.email)) {
      
      // Update last checked info
      lastCheckedInfo.current = {
        phone: booking.phone || '',
        email: booking.email || ''
      };
      
      const checkExistingCustomer = async () => {
        setIsCheckingCustomer(true);
        const existingCustomer = await findCustomerByEmailOrPhone(booking.email || "", booking.phone);
        const wasReturningCustomer = isReturningCustomer;
        setIsReturningCustomer(!!existingCustomer);
        setIsCheckingCustomer(false);
        
        // Only show toast if customer just identified and not previously notified
        if (existingCustomer && !wasReturningCustomer && !returnNotified) {
          setReturnNotified(true);
          toast({
            title: "Returning Customer",
            description: `${existingCustomer.name} has booked with you ${existingCustomer.totalBookings} time(s) before.`,
          });
        }
      };
      
      checkExistingCustomer();
    }
  }, [booking.phone, booking.email, findCustomerByEmailOrPhone, isEditing, isReturningCustomer, returnNotified]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {currentStep === "customer" && (
        <div className="space-y-4">
          <CustomerInfoFields
            customer={booking.customer}
            phone={booking.phone}
            email={booking.email}
            car={booking.car}
            handleChange={handleChange}
            isReturningCustomer={isReturningCustomer}
            isCheckingCustomer={isCheckingCustomer}
          />
          
          <div className="flex justify-end">
            <Button type="button" onClick={goToNextStep} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === "workshop" && (
        <div className="space-y-4">
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
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goToPreviousStep} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button type="button" onClick={goToNextStep} className="gap-1">
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {currentStep === "scheduling" && (
        <div className="space-y-4">
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
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={goToPreviousStep} className="gap-1">
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
          </div>
        </div>
      )}
      
      <DialogFooter className="flex justify-between">
        {isEditing && onDeleteClick && currentStep === "scheduling" && (
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
          {currentStep === "scheduling" && (
            <Button type="submit">
              {isEditing ? "Save Changes" : "Save Booking"}
            </Button>
          )}
        </div>
      </DialogFooter>
    </form>
  );
};

export default BookingForm;
