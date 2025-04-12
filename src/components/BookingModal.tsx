
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingType } from "@/types/booking";
import BookingForm from "./booking/BookingForm";
import DeleteConfirmationDialog from "./booking/DeleteConfirmationDialog";
import { useEditBookingForm } from "@/hooks/bookings/useEditBookingForm";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VehicleLookupForm from "./booking/VehicleLookupForm";
import VehicleDetailsForm from "./booking/VehicleDetailsForm";
import { Vehicle } from "@/types/nevdis";
import { Button } from "./ui/button";

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
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Define a local state for edited booking
  const [localEditedBooking, setLocalEditedBooking] = useState<BookingType | null>(null);
  
  const {
    editedBooking,
    date,
    technicians,
    services,
    bays,
    selectedServiceId,
    selectedTechnicianId,
    selectedBayId,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleChange,
    handleSelectChange,
    handleDateChange,
    handleSubmit,
    handleDeleteClick
  } = useEditBookingForm(isOpen, onClose, booking, onSave);

  // Use local state to track and modify the booking
  useEffect(() => {
    if (editedBooking) {
      setLocalEditedBooking(editedBooking);
    }
  }, [editedBooking]);

  const [activeTab, setActiveTab] = useState<string>("customer");
  const [showVehicleLookup, setShowVehicleLookup] = useState<boolean>(false);
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);

  // Reset state when modal is reopened
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setDeleteSuccess(false);
      setActiveTab("customer");
      setShowVehicleLookup(false);
      setIsManualEntry(false);
    }
  }, [isOpen]);

  if (!localEditedBooking || !editedBooking) return null;

  const handleDeleteConfirm = async () => {
    if (!editedBooking || !onDelete) return;
    
    setIsDeleting(true);
    console.log("Starting booking deletion process for:", editedBooking);
    
    try {
      const success = await onDelete(editedBooking);
      
      if (success) {
        console.log("Delete successful, closing dialogs");
        setDeleteSuccess(true);
        
        toast({
          title: "Success",
          description: "Booking was successfully deleted",
        });
        
        // Close dialogs after successful deletion
        setIsDeleteDialogOpen(false);
        
        // Brief delay before closing the main modal
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        throw new Error("Delete operation returned false");
      }
    } catch (error: any) {
      console.error("Error deleting booking in BookingModal:", error);
      
      // Provide more specific error messages based on the error type
      let errorMessage = "An unexpected error occurred while deleting the booking.";
      
      if (error?.message) {
        if (error.message.includes("Could not find booking")) {
          errorMessage = "Could not find the booking to delete. It may have been already removed.";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes("permission") || error.message.includes("access")) {
          errorMessage = "You don't have permission to delete this booking.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleVehicleFound = (vehicle: Vehicle) => {
    // Get registration details
    const plateNumber = vehicle.identification?.plate || "";
    const state = vehicle.identification?.state || "";
    
    // Map NEVDIS vehicle data to booking form fields with additional details
    const carMake = vehicle.extendedData?.makeDescription || "";
    const carModel = vehicle.extendedData?.model || "";
    const carYear = vehicle.vehicleAge?.yearOfManufacture ? `(${vehicle.vehicleAge.yearOfManufacture})` : "";
    const carColor = vehicle.extendedData?.colour ? `- ${vehicle.extendedData.colour}` : "";
    const carBodyType = vehicle.extendedData?.bodyType || "";
    
    // Create a comprehensive car description
    const carInfo = [carMake, carModel, carYear, carColor].filter(Boolean).join(" ");
    
    // Store additional vehicle details in the booking using local state
    setLocalEditedBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        car: carInfo,
        vehicleDetails: {
          make: carMake,
          model: carModel,
          year: vehicle.vehicleAge?.yearOfManufacture?.toString() || "",
          vin: vehicle.identification?.vin || "",
          color: vehicle.extendedData?.colour || "",
          bodyType: carBodyType,
          plateNumber: plateNumber,
          state: state
        }
      };
    });

    // Hide vehicle lookup after success
    toast({
      title: "Vehicle Updated",
      description: `Successfully updated to ${carMake} ${carModel}`
    });
    setShowVehicleLookup(false);
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
    
    // Update booking state with vehicle details using local state
    setLocalEditedBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        car: carInfo,
        vehicleDetails
      };
    });
    
    // Hide vehicle lookup after success
    toast({
      title: "Vehicle Updated",
      description: "Vehicle information has been updated"
    });
    setShowVehicleLookup(false);
    setActiveTab("customer");
  };

  // When saving the form, use the local state
  const handleSaveWithUpdates = () => {
    if (localEditedBooking) {
      handleSubmit(localEditedBooking);
    }
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
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            {showVehicleLookup && (
              <TabsContent value="vehicle">
                {!isManualEntry ? (
                  <VehicleLookupForm 
                    onVehicleFound={handleVehicleFound} 
                    onManualEntry={handleManualEntry}
                  />
                ) : (
                  <VehicleDetailsForm 
                    initialDetails={localEditedBooking.vehicleDetails}
                    onSubmit={handleVehicleDetailsUpdate}
                    onCancel={() => setIsManualEntry(false)}
                  />
                )}
                
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => {
                      setShowVehicleLookup(false); 
                      setActiveTab("customer");
                    }}
                    variant="outline"
                  >
                    Cancel Vehicle Update
                  </Button>
                </div>
              </TabsContent>
            )}
            
            <TabsContent value="customer">
              <BookingForm
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
                handleDateChange={handleDateChange}
                handleSubmit={handleSaveWithUpdates}
                onClose={onClose}
                isEditing={true}
                currentStep="customer"
                onStepChange={setActiveTab}
                onDeleteClick={handleDeleteClick}
              />
              
              {!showVehicleLookup && (
                <div className="mt-4 border-t pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowVehicleLookup(true);
                      setActiveTab("vehicle");
                    }}
                    className="text-sm"
                  >
                    Update Vehicle Information
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="details">
              <BookingForm
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
                handleDateChange={handleDateChange}
                handleSubmit={handleSaveWithUpdates}
                onClose={onClose}
                isEditing={true}
                currentStep="scheduling"
                onStepChange={setActiveTab}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
            
            <TabsContent value="notes">
              <BookingForm
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
                handleDateChange={handleDateChange}
                handleSubmit={handleSaveWithUpdates}
                onClose={onClose}
                isEditing={true}
                currentStep="workshop"
                onStepChange={setActiveTab}
                onDeleteClick={handleDeleteClick}
              />
            </TabsContent>
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
