
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

const defaultBooking: BookingType = {
  id: 0,
  customer: "",
  phone: "",
  email: "",
  service: "",
  time: "9:00 AM",
  duration: 30,
  car: "",
  status: "pending",
  date: format(new Date(), 'yyyy-MM-dd'),
  notes: ""
};

export const useNewBookingForm = (
  isOpen: boolean,
  onClose: () => void,
  onSave: (booking: BookingType) => void
) => {
  const [newBooking, setNewBooking] = useState<BookingType>({...defaultBooking});
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [bays, setBays] = useState<BayOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Fetch technicians, services, and bays when the modal is opened
    if (isOpen) {
      fetchTechnicians();
      fetchServices();
      fetchBays();
    }
  }, [isOpen]);

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
    setNewBooking((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "duration") {
      setNewBooking((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else if (name === "status") {
      const typedStatus = value as "pending" | "confirmed" | "cancelled" | "completed";
      setNewBooking((prev) => ({ ...prev, status: typedStatus }));
    } else if (name === "service") {
      // When a service is selected, get its details
      const selectedService = services.find(service => service.name === value);
      if (selectedService) {
        setNewBooking((prev) => ({ 
          ...prev, 
          service: value,
          duration: selectedService.duration
        }));
        setSelectedServiceId(selectedService.id);
      } else {
        setNewBooking((prev) => ({ ...prev, [name]: value }));
        setSelectedServiceId(null);
      }
    } else if (name === "serviceId") {
      // This is for selecting by ID directly from the database
      setSelectedServiceId(value);
      const selectedService = services.find(service => service.id === value);
      if (selectedService) {
        setNewBooking((prev) => ({ 
          ...prev, 
          service: selectedService.name,
          duration: selectedService.duration
        }));
      }
    } else if (name === "technicianId") {
      setSelectedTechnicianId(value);
    } else if (name === "bayId") {
      setSelectedBayId(value);
    } else {
      setNewBooking((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      const formattedDate = format(newDate, 'yyyy-MM-dd');
      setNewBooking((prev) => ({ ...prev, date: formattedDate }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const bookingWithId = {
      ...newBooking,
      id: Date.now(),
      technician_id: selectedTechnicianId,
      service_id: selectedServiceId,
      bay_id: selectedBayId
    };
    onSave(bookingWithId);
    
    // Reset form after submission
    resetForm();
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setNewBooking({...defaultBooking});
    setDate(new Date());
    setSelectedServiceId(null);
    setSelectedTechnicianId(null);
    setSelectedBayId(null);
  };

  return {
    newBooking,
    setNewBooking,
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
    handleCloseModal
  };
};
