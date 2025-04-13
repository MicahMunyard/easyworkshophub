
import { useState, useEffect, useRef } from "react";
import { BookingType } from "@/types/booking";
import { useToast } from "@/hooks/use-toast";
import { useCustomerAPI } from "@/hooks/customers/useCustomerAPI";

interface UseBookingFormProps {
  booking: BookingType;
  isEditing: boolean;
  onStepChange?: (step: string) => void;
  currentStep?: "customer" | "workshop" | "scheduling";
}

export const useBookingForm = ({
  booking,
  isEditing,
  onStepChange,
  currentStep = "customer"
}: UseBookingFormProps) => {
  const { toast } = useToast();
  const { findCustomerByEmailOrPhone } = useCustomerAPI();
  const [isReturningCustomer, setIsReturningCustomer] = useState(false);
  const [isCheckingCustomer, setIsCheckingCustomer] = useState(false);
  const [returnNotified, setReturnNotified] = useState(false);
  const [activeStep, setActiveStep] = useState<"customer" | "workshop" | "scheduling">(currentStep);
  const lastCheckedInfo = useRef({ phone: '', email: '' });

  useEffect(() => {
    if (currentStep) {
      setActiveStep(currentStep);
    }
  }, [currentStep]);

  const goToNextStep = () => {
    if (activeStep === "customer") {
      if (!booking.customer || !booking.phone || !booking.car) {
        toast({
          title: "Missing information",
          description: "Please fill in all required customer information.",
          variant: "destructive"
        });
        return;
      }
      
      if (onStepChange) {
        onStepChange("details");
      } else {
        setActiveStep("workshop");
      }
    } else if (activeStep === "workshop") {
      if (!booking.service) {
        toast({
          title: "Missing information",
          description: "Please select a service.",
          variant: "destructive"
        });
        return;
      }
      
      setActiveStep("scheduling");
    }
  };

  const goToPreviousStep = () => {
    if (activeStep === "scheduling") {
      setActiveStep("workshop");
    } else if (activeStep === "workshop") {
      if (onStepChange) {
        onStepChange("customer");
      } else {
        setActiveStep("customer");
      }
    }
  };
  
  useEffect(() => {
    if (isEditing) return;
    
    if ((booking.phone && booking.phone.length > 5 && booking.phone !== lastCheckedInfo.current.phone) || 
        (booking.email && booking.email.length > 5 && booking.email !== lastCheckedInfo.current.email)) {
      
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
  }, [booking.phone, booking.email, findCustomerByEmailOrPhone, isEditing, isReturningCustomer, returnNotified, toast]);

  return {
    activeStep,
    isReturningCustomer, 
    isCheckingCustomer,
    goToNextStep,
    goToPreviousStep,
    setActiveStep
  };
};
