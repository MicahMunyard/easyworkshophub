
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import BookingForm from "@/components/booking/BookingForm";
import { BookingType } from "@/types/booking";

interface WorkshopNotesTabProps {
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
  onStepChange: (step: string) => void;
  onDeleteClick?: () => void;
  activeTab: string;
}

const WorkshopNotesTab: React.FC<WorkshopNotesTabProps> = ({
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
  onStepChange,
  onDeleteClick,
  activeTab
}) => {
  return (
    <TabsContent value="workshop">
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
        currentStep="workshop"
        onStepChange={onStepChange}
        onDeleteClick={onDeleteClick}
      />
    </TabsContent>
  );
};

export default WorkshopNotesTab;
