
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { BookingType } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";

// Import our new components
import CustomerInfoFields from "./booking/CustomerInfoFields";
import ServiceSelector from "./booking/ServiceSelector";
import TechnicianSelector from "./booking/TechnicianSelector";
import ServiceBaySelector from "./booking/ServiceBaySelector";
import DateSelector from "./booking/DateSelector";
import TimeStatusSelector from "./booking/TimeStatusSelector";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingType) => void;
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

const defaultBooking: BookingType = {
  id: 0,
  customer: "",
  phone: "",
  service: "",
  time: "9:00 AM",
  duration: 30,
  car: "",
  status: "pending",
  date: format(new Date(), 'yyyy-MM-dd')
};

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newBooking, setNewBooking] = useState<BookingType>({...defaultBooking});
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [technicians, setTechnicians] = useState<TechnicianOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [bays, setBays] = useState<BayOption[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);
  const [selectedBayId, setSelectedBayId] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setNewBooking({...defaultBooking});
    setDate(new Date());
    setSelectedServiceId(null);
    setSelectedTechnicianId(null);
    setSelectedBayId(null);
  };

  const handleCloseModal = () => {
    setNewBooking({...defaultBooking});
    setDate(new Date());
    setSelectedServiceId(null);
    setSelectedTechnicianId(null);
    setSelectedBayId(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCloseModal}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New Booking</DialogTitle>
            <DialogDescription>
              Enter the details for the new booking.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <CustomerInfoFields
              customer={newBooking.customer}
              phone={newBooking.phone}
              car={newBooking.car}
              handleChange={handleChange}
            />
            
            <ServiceSelector
              selectedServiceId={selectedServiceId}
              services={services}
              onServiceChange={(value) => handleSelectChange("serviceId", value)}
            />
            
            <TechnicianSelector
              selectedTechnicianId={selectedTechnicianId}
              technicians={technicians}
              onTechnicianChange={(value) => handleSelectChange("technicianId", value)}
            />
            
            <ServiceBaySelector
              selectedBayId={selectedBayId}
              bays={bays}
              onBayChange={(value) => handleSelectChange("bayId", value)}
            />
            
            <DateSelector
              date={date}
              onDateChange={handleDateChange}
            />
            
            <TimeStatusSelector
              time={newBooking.time}
              status={newBooking.status}
              onSelectChange={handleSelectChange}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit">Save Booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewBookingModal;
