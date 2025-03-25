
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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

export const useEditBookingForm = (
  isOpen: boolean,
  onClose: () => void,
  booking: BookingType | null,
  onSave: (booking: BookingType) => void
) => {
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
  const { user } = useAuth();

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
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_technicians')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) throw error;
      setTechnicians(data || []);
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const fetchServices = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_services')
        .select('id, name, duration, price')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchBays = async () => {
    try {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_service_bays')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
        
      if (error) throw error;
      setBays(data || []);
    } catch (error) {
      console.error('Error fetching service bays:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
  };

  return {
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
    handleDeleteClick,
    handleDeleteDialogClose
  };
};
