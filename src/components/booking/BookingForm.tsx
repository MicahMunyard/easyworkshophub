import React from "react";
import { BookingType } from "@/types/booking";
import { useBookingForm } from "@/hooks/bookings/useBookingForm";
import CustomerInfoFields from "./CustomerInfoFields";
import ServiceSelector from "./ServiceSelector";
import TechnicianSelector from "./TechnicianSelector";
import ServiceBaySelector from "./ServiceBaySelector";
import DateSelector from "./DateSelector";
import TimeStatusSelector from "./TimeStatusSelector";
import NotesSection from "./NotesSection";
import StepNavigation from "./StepNavigation";
import FormFooter from "./FormFooter";

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
  currentStep?: "customer" | "workshop" | "scheduling";
  onStepChange?: (step: string) => void;
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
  onDeleteClick,
  currentStep = "customer",
  onStepChange
}) => {
  const {
    activeStep,
    isReturningCustomer,
    isCheckingCustomer,
    goToNextStep,
    goToPreviousStep
  } = useBookingForm({
    booking,
    isEditing,
    onStepChange,
    currentStep
  });

  const renderCustomerStep = () => (
    <div className="space-y-4">
      <CustomerInfoFields
        customer={booking.customer}
        phone={booking.phone}
        email={booking.email}
        car={booking.car}
        vehicleDetails={booking.vehicleDetails}
        handleChange={handleChange}
        isReturningCustomer={isReturningCustomer}
        isCheckingCustomer={isCheckingCustomer}
      />
      <StepNavigation 
        step="customer"
        onNext={goToNextStep}
        showBack={false}
      />
    </div>
  );

  const renderWorkshopStep = () => (
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
      <StepNavigation 
        step="workshop"
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
      />
    </div>
  );

  const renderSchedulingStep = () => (
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
      <NotesSection 
        notes={booking.notes}
        handleChange={handleChange}
      />
      <StepNavigation 
        step="scheduling"
        onPrevious={goToPreviousStep}
        showNext={false}
      />
    </div>
  );

  const renderFormContent = () => {
    // If currentStep is specified, render only that step
    if (currentStep === "customer") {
      return renderCustomerStep();
    }
    if (currentStep === "workshop") {
      return renderWorkshopStep();
    }
    if (currentStep === "scheduling") {
      return renderSchedulingStep();
    }

    // Otherwise, render based on activeStep
    switch(activeStep) {
      case "customer":
        return renderCustomerStep();
      case "workshop":
        return renderWorkshopStep();
      case "scheduling":
        return renderSchedulingStep();
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {renderFormContent()}
      
      {activeStep === "scheduling" && !currentStep && (
        <FormFooter 
          isEditing={isEditing}
          onDeleteClick={onDeleteClick}
          onClose={onClose}
          type="scheduling"
        />
      )}
      
      {currentStep === "scheduling" && (
        <FormFooter 
          isEditing={isEditing}
          onDeleteClick={onDeleteClick}
          onClose={onClose}
          type="scheduling"
        />
      )}
    </form>
  );
};

export default BookingForm;
