
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import BookingForm from "./booking/BookingForm";
import { useNewBookingForm } from "@/hooks/bookings/useNewBookingForm";
import VehicleLookupForm from "./booking/VehicleLookupForm";
import { Vehicle } from "@/types/nevdis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingType) => void;
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, onSave }) => {
  const {
    newBooking,
    date,
    technicians,
    services,
    bays,
    selectedServiceId,
    selectedTechnicianId,
    selectedBayId,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleCloseModal,
    setNewBooking
  } = useNewBookingForm(isOpen, onClose, onSave);

  const [activeTab, setActiveTab] = useState<string>("vehicle");

  const handleVehicleFound = (vehicle: Vehicle) => {
    // Map NEVDIS vehicle data to booking form fields
    const carInfo = [
      vehicle.extendedData?.makeDescription, 
      vehicle.extendedData?.model,
      vehicle.vehicleAge?.yearOfManufacture && `(${vehicle.vehicleAge.yearOfManufacture})`,
      vehicle.extendedData?.colour && `- ${vehicle.extendedData.colour}`
    ].filter(Boolean).join(" ");
    
    setNewBooking(prev => ({
      ...prev,
      car: carInfo
    }));

    // Move to customer tab automatically
    setActiveTab("customer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Enter the details for the new booking.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="vehicle">Vehicle</TabsTrigger>
            <TabsTrigger value="customer">Customer</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="vehicle">
            <VehicleLookupForm onVehicleFound={handleVehicleFound} />
            
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setActiveTab("customer")}
                className="text-sm text-muted-foreground hover:underline"
              >
                Skip vehicle lookup →
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="customer">
            <BookingForm
              booking={newBooking}
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
              onClose={handleCloseModal}
              isEditing={false}
              currentStep="customer"
              onStepChange={setActiveTab}
            />
          </TabsContent>
          
          <TabsContent value="details">
            <BookingForm
              booking={newBooking}
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
              onClose={handleCloseModal}
              isEditing={false}
              currentStep="scheduling"
              onStepChange={setActiveTab}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
