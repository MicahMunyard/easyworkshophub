
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
import VehicleDetailsForm from "./booking/VehicleDetailsForm";
import { toast } from "@/components/ui/use-toast";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingType) => void;
  initialData?: Partial<BookingType>;
  emailId?: string;
}

const NewBookingModal: React.FC<NewBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData,
  emailId 
}) => {
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
  } = useNewBookingForm(isOpen, onClose, onSave, initialData);

  const [activeTab, setActiveTab] = useState<string>("vehicle");
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);

  const handleVehicleFound = (vehicle: Vehicle) => {
    // Map NEVDIS vehicle data to booking form fields with additional details
    const carMake = vehicle.extendedData?.makeDescription || "";
    const carModel = vehicle.extendedData?.model || "";
    const carModelDesc = vehicle.extendedData?.modelDescription || "";
    const carYear = vehicle.vehicleAge?.yearOfManufacture ? `(${vehicle.vehicleAge.yearOfManufacture})` : "";
    const carColor = vehicle.extendedData?.colour ? `- ${vehicle.extendedData.colour}` : "";
    const carBodyType = vehicle.extendedData?.bodyType || "";
    
    // Create a comprehensive car description
    const carInfo = [carMake, carModel, carModelDesc, carYear, carColor].filter(Boolean).join(" ");
    
    // Store additional vehicle details in the booking
    setNewBooking(prev => ({
      ...prev,
      car: carInfo,
      vehicleDetails: {
        make: carMake,
        model: carModel,
        modelDescription: carModelDesc,
        year: vehicle.vehicleAge?.yearOfManufacture?.toString() || "",
        vin: vehicle.identification?.vin || "",
        color: vehicle.extendedData?.colour || "",
        bodyType: carBodyType,
        plateNumber: vehicle.identification?.plate || "",
        state: vehicle.identification?.state || ""
      }
    }));

    // Move to customer tab automatically
    toast({
      title: "Vehicle Found",
      description: `Successfully loaded details for ${carMake} ${carModel}`
    });
    setActiveTab("customer");
  };

  const handleManualEntry = () => {
    setIsManualEntry(true);
  };

  const handleVehicleDetailsUpdate = (vehicleDetails: BookingType['vehicleDetails']) => {
    // Create a comprehensive car description
    const carInfo = [
      vehicleDetails?.make, 
      vehicleDetails?.model, 
      vehicleDetails?.year ? `(${vehicleDetails.year})` : "",
      vehicleDetails?.color ? `- ${vehicleDetails.color}` : ""
    ].filter(Boolean).join(" ");
    
    // Update booking state with vehicle details
    setNewBooking(prev => ({
      ...prev,
      car: carInfo,
      vehicleDetails
    }));
    
    // Move to customer tab
    toast({
      title: "Vehicle Details Added",
      description: "Vehicle information has been added to the booking"
    });
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
            {!isManualEntry ? (
              <VehicleLookupForm 
                onVehicleFound={handleVehicleFound} 
                onManualEntry={handleManualEntry}
              />
            ) : (
              <VehicleDetailsForm 
                initialDetails={newBooking.vehicleDetails}
                onSubmit={handleVehicleDetailsUpdate}
                onCancel={() => setIsManualEntry(false)}
              />
            )}
            
            {!isManualEntry && (
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setActiveTab("customer")}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  Skip vehicle lookup →
                </button>
              </div>
            )}
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
