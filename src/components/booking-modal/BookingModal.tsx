
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingType } from "@/types/booking";
import { useEditBookingForm } from "@/hooks/bookings/useEditBookingForm";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeleteConfirmationDialog from "../booking/DeleteConfirmationDialog";
import CustomerDetailsTab from "./tabs/CustomerDetailsTab";
import BookingDetailsTab from "./tabs/BookingDetailsTab";
import WorkshopNotesTab from "./tabs/WorkshopNotesTab";
import VehicleTab from "./tabs/VehicleTab";
import useBookingModalState from "./useBookingModalState";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
  onSave: (booking: BookingType) => Promise<void>;
  onDelete?: (booking: BookingType) => Promise<boolean>;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave,
  onDelete 
}) => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const { toast } = useToast();
  
  const {
    editedBooking,
    localEditedBooking,
    date,
    technicians,
    services,
    bays,
    selectedServiceId,
    selectedTechnicianId,
    selectedBayId,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isDeleting,
    deleteSuccess,
    activeTab,
    showVehicleLookup,
    isManualEntry,
    setActiveTab,
    setShowVehicleLookup,
    setIsManualEntry,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleDeleteClick,
    handleVehicleFound,
    handleManualEntry,
    handleVehicleDetailsUpdate,
    handleSaveWithUpdates,
    handleDeleteConfirm
  } = useBookingModalState(isOpen, onClose, booking, onSave, onDelete);

  if (!localEditedBooking || !editedBooking) return null;

  const handleDateChangeWrapper = (newDate: Date | undefined) => {
    handleDateChange(newDate);
  };

  return (
    <>
      <Dialog open={isOpen && !isDeleting && !deleteSuccess} onOpenChange={(open) => {
        if (!isDeleting && !deleteSuccess && !open) {
          onClose();
        }
      }}>
        <DialogContent className={`${isMobile ? 'w-[95%] p-4 max-h-[90vh] overflow-y-auto' : 'sm:max-w-[500px]'}`}>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Make changes to the booking details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              {showVehicleLookup && <TabsTrigger value="vehicle">Vehicle</TabsTrigger>}
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="workshop">Notes</TabsTrigger>
            </TabsList>
            
            {showVehicleLookup && (
              <VehicleTab 
                isManualEntry={isManualEntry}
                initialVehicleDetails={localEditedBooking.vehicleDetails}
                onVehicleFound={handleVehicleFound}
                onManualEntry={handleManualEntry}
                onVehicleDetailsSubmit={handleVehicleDetailsUpdate}
                onCancel={() => {
                  setShowVehicleLookup(false); 
                  setActiveTab("customer");
                  setIsManualEntry(false);
                }}
              />
            )}
            
            <CustomerDetailsTab 
              booking={localEditedBooking}
              date={date}
              services={services}
              technicians={technicians}
              bays={bays}
              selectedServiceId={selectedServiceId}
              selectedTechnicianId={selectedTechnicianId}
              selectedBayId={selectedBayId}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleDateChange={handleDateChangeWrapper}
              handleSubmit={handleSaveWithUpdates}
              onClose={onClose}
              isEditing={true}
              onDeleteClick={handleDeleteClick}
              onStepChange={setActiveTab}
              showVehicleLookup={showVehicleLookup}
              onUpdateVehicle={() => {
                setShowVehicleLookup(true);
                setActiveTab("vehicle");
              }}
              activeTab={activeTab}
            />
            
            <BookingDetailsTab 
              booking={localEditedBooking}
              date={date}
              services={services}
              technicians={technicians}
              bays={bays}
              selectedServiceId={selectedServiceId}
              selectedTechnicianId={selectedTechnicianId}
              selectedBayId={selectedBayId}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleDateChange={handleDateChangeWrapper}
              handleSubmit={handleSaveWithUpdates}
              onClose={onClose}
              isEditing={true}
              onStepChange={setActiveTab}
              onDeleteClick={handleDeleteClick}
              activeTab={activeTab}
            />
            
            <WorkshopNotesTab 
              booking={localEditedBooking}
              date={date}
              services={services}
              technicians={technicians}
              bays={bays}
              selectedServiceId={selectedServiceId}
              selectedTechnicianId={selectedTechnicianId}
              selectedBayId={selectedBayId}
              handleChange={handleChange}
              handleSelectChange={handleSelectChange}
              handleDateChange={handleDateChangeWrapper}
              handleSubmit={handleSaveWithUpdates}
              onClose={onClose}
              isEditing={true}
              onStepChange={setActiveTab}
              onDeleteClick={handleDeleteClick}
              activeTab={activeTab}
            />
          </Tabs>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        booking={editedBooking}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default BookingModal;
