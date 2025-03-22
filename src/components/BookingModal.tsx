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
import { Car, Wrench, User, Phone, Clock, CalendarIcon, Warehouse, Trash2 } from "lucide-react";
import { BookingType } from "@/types/booking";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

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
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Booking</DialogTitle>
              <DialogDescription>
                Make changes to the booking details. Click save when you're done.
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
                  value={editedBooking.customer}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={editedBooking.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="car" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Vehicle
                </Label>
                <Input
                  id="car"
                  name="car"
                  value={editedBooking.car}
                  onChange={handleChange}
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
              
              <div className="grid gap-2">
                <Label htmlFor="time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Time
                </Label>
                <Select 
                  value={editedBooking.time} 
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
                  value={editedBooking.status} 
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
            <DialogFooter className="flex justify-between">
              <div>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleDeleteClick}
                  className="gap-1"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
              {editedBooking && (
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <p className="font-medium">{editedBooking.customer}</p>
                  <p className="text-sm">{editedBooking.service} - {format(new Date(editedBooking.date), 'PP')} at {editedBooking.time}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BookingModal;
