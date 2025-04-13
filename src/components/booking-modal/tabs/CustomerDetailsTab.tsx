
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import BookingForm from "@/components/booking/BookingForm";
import { BookingType } from "@/types/booking";
import { Button } from "@/components/ui/button";

interface CustomerDetailsTabProps {
  booking: BookingType;
  date: Date | undefined;
  services: any[];
  technicians: any[];
  bays: any[];
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
  onStepChange: (step: string) => void;
  showVehicleLookup: boolean;
  onUpdateVehicle: () => void;
  activeTab: string;
}

const CustomerDetailsTab: React.FC<CustomerDetailsTabProps> = ({
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
  onStepChange,
  showVehicleLookup,
  onUpdateVehicle,
  activeTab
}) => {
  return (
    <TabsContent value="customer">
      <BookingForm
        booking={booking}
        date={date}
        services={services}
        technicians={technicians}
        bays={bays}
        selectedServiceId={selectedServiceId}
        selectedTechnicianId={selectedTechnicianId}
        selectedBayId={selectedBayId}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleDateChange={handleDateChange}
        handleSubmit={handleSubmit}
        onClose={onClose}
        isEditing={isEditing}
        currentStep="customer"
        onStepChange={onStepChange}
        onDeleteClick={onDeleteClick}
      />
      
      {!showVehicleLookup && activeTab === "customer" && (
        <div className="mt-4 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onUpdateVehicle}
            className="text-sm"
          >
            Update Vehicle Information
          </Button>
        </div>
      )}
    </TabsContent>
  );
};

export default CustomerDetailsTab;
