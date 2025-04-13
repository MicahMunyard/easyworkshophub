
import { useState, useEffect } from "react";
import { BookingType } from "@/types/booking";
import { useEditBookingForm } from "@/hooks/bookings/useEditBookingForm";
import { useToast } from "@/hooks/use-toast";
import { Vehicle } from "@/types/nevdis";

const useBookingModalState = (
  isOpen: boolean,
  onClose: () => void,
  booking: BookingType | null,
  onSave: (booking: BookingType) => Promise<void>,
  onDelete?: (booking: BookingType) => Promise<boolean>
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const { toast } = useToast();
  
  const [localEditedBooking, setLocalEditedBooking] = useState<BookingType | null>(null);
  const [activeTab, setActiveTab] = useState<string>("customer");
  const [showVehicleLookup, setShowVehicleLookup] = useState<boolean>(false);
  const [isManualEntry, setIsManualEntry] = useState<boolean>(false);
  
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

  useEffect(() => {
    if (editedBooking) {
      setLocalEditedBooking(editedBooking);
    }
  }, [editedBooking]);

  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setDeleteSuccess(false);
      setActiveTab("customer");
      setShowVehicleLookup(false);
      setIsManualEntry(false);
    }
  }, [isOpen]);

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
        
        setIsDeleteDialogOpen(false);
        
        setTimeout(() => {
          onClose();
        }, 300);
      } else {
        throw new Error("Delete operation returned false");
      }
    } catch (error: any) {
      console.error("Error deleting booking in BookingModal:", error);
      
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
    const plateNumber = vehicle.identification?.plate || "";
    const state = vehicle.identification?.state || "";
    
    const carMake = vehicle.extendedData?.makeDescription || "";
    const carModel = vehicle.extendedData?.model || "";
    const carYear = vehicle.vehicleAge?.yearOfManufacture ? `(${vehicle.vehicleAge.yearOfManufacture})` : "";
    const carColor = vehicle.extendedData?.colour ? `- ${vehicle.extendedData.colour}` : "";
    const carBodyType = vehicle.extendedData?.bodyType || "";
    
    const carInfo = [carMake, carModel, carYear, carColor].filter(Boolean).join(" ");
    
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
    const carInfo = [
      vehicleDetails?.make, 
      vehicleDetails?.model, 
      vehicleDetails?.year ? `(${vehicleDetails.year})` : "",
      vehicleDetails?.color ? `- ${vehicleDetails.color}` : ""
    ].filter(Boolean).join(" ");
    
    setLocalEditedBooking(prev => {
      if (!prev) return null;
      return {
        ...prev,
        car: carInfo,
        vehicleDetails
      };
    });
    
    toast({
      title: "Vehicle Updated",
      description: "Vehicle information has been updated"
    });
    setShowVehicleLookup(false);
    setActiveTab("customer");
  };

  const handleSaveWithUpdates = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (localEditedBooking && editedBooking) {
      const updatedBooking = {
        ...editedBooking,
        car: localEditedBooking.car,
        vehicleDetails: localEditedBooking.vehicleDetails
      };
      
      onSave(updatedBooking);
    }
  };

  return {
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
  };
};

export default useBookingModalState;
