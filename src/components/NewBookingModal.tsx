
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Car, Wrench, User, Phone, Clock, CalendarIcon, Warehouse } from "lucide-react";
import { BookingType } from "@/types/booking";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

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
            <div className="grid gap-2">
              <Label htmlFor="customer" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Customer Name
              </Label>
              <Input
                id="customer"
                name="customer"
                value={newBooking.customer}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={newBooking.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="car" className="flex items-center gap-2">
                <Car className="h-4 w-4" /> Vehicle
              </Label>
              <Input
                id="car"
                name="car"
                value={newBooking.car}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="serviceId" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Service
              </Label>
              <Select 
                value={selectedServiceId || ""} 
                onValueChange={(value) => handleSelectChange("serviceId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - ${service.price.toFixed(2)} - {service.duration} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="technicianId" className="flex items-center gap-2">
                <User className="h-4 w-4" /> Technician
              </Label>
              <Select 
                value={selectedTechnicianId || ""} 
                onValueChange={(value) => handleSelectChange("technicianId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select technician" />
                </SelectTrigger>
                <SelectContent>
                  {technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.id}>
                      {tech.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="bayId" className="flex items-center gap-2">
                <Warehouse className="h-4 w-4" /> Service Bay
              </Label>
              <Select 
                value={selectedBayId || ""} 
                onValueChange={(value) => handleSelectChange("bayId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service bay" />
                </SelectTrigger>
                <SelectContent>
                  {bays.map((bay) => (
                    <SelectItem key={bay.id} value={bay.id}>
                      {bay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Time
                </Label>
                <Select 
                  value={newBooking.time} 
                  onValueChange={(value) => handleSelectChange("time", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
                      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
                      "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
                      "5:00 PM", "5:30 PM"].map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  Status
                </Label>
                <Select 
                  value={newBooking.status} 
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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
