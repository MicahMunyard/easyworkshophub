
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import BookingForm from "./booking/BookingForm";
import DeleteConfirmationDialog from "./booking/DeleteConfirmationDialog";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
  onSave: (booking: BookingType) => void;
  onDelete?: (booking: BookingType) => void;
}

interface TechnicianOption {
  id: string;
  name: string;
}

interface ServiceOption {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface BayOption {
  id: string;
  name: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onSave,
  onDelete 
}) => {
  const [editedBooking, setEditedBooking] = useState<BookingType | null>(booking);
  const [date, setDate] = useState<Date | undefined>(
    booking?.date ? new Date(booking.date) : undefined
  );
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [bays, setBays] = useState<BayOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setEditedBooking(booking);
    setDate(booking?.date ? new Date(booking.date) : undefined);
    
    setSelectedServiceId(booking?.service_id || null);
    setSelectedTechnicianId(booking?.technician_id || null);
    setSelectedBayId(booking?.bay_id || null);

    if (isOpen) {
      fetchTechnicians();
      fetchServices();
      fetchBays();
    }
  }, [booking, isOpen]);

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('technicians')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, duration, price')
        .order('name');
        
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBays = async () => {
    try {
      const { data, error } = await supabase
        .from('service_bays')
        .select('id, name')
        .order('name');
        
      if (error) throw error;
      setBays(data || []);
    } catch (error) {
      console.error('Error fetching service bays:', error);
    }
  };

  if (!editedBooking) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBooking((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      const typedStatus = value as "pending" | "confirmed" | "cancelled" | "completed";
      setEditedBooking((prev) => prev ? { ...prev, status: typedStatus } : null);
    } else if (name === "serviceId") {
      setSelectedServiceId(value);
      const selectedService = services.find(service => service.id === value);
      if (selectedService && editedBooking) {
        setEditedBooking({
          ...editedBooking,
          service: selectedService.name,
          duration: selectedService.duration,
          service_id: selectedService.id
        });
      }
    } else if (name === "technicianId") {
      setSelectedTechnicianId(value);
      if (editedBooking) {
        setEditedBooking({
          ...editedBooking,
          technician_id: value
        });
      }
    } else if (name === "bayId") {
      setSelectedBayId(value);
      if (editedBooking) {
        setEditedBooking({
          ...editedBooking,
          bay_id: value
        });
      }
    } else {
      setEditedBooking((prev) => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      setEditedBooking((prev) => prev ? { ...prev, date: formattedDate } : null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedBooking) {
      onSave({
        ...editedBooking,
        technician_id: selectedTechnicianId,
        service_id: selectedServiceId,
        bay_id: selectedBayId
      });
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (editedBooking && onDelete) {
      onDelete(editedBooking);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Make changes to the booking details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <BookingForm
            booking={editedBooking}
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
            isEditing={true}
            onDeleteClick={handleDeleteClick}
          />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        booking={editedBooking}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default BookingModal;
