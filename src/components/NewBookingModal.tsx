
import React, { useState } from "react";
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
import { Car, Wrench, User, Phone, Clock } from "lucide-react";
import { BookingType } from "@/types/booking";

interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (booking: BookingType) => void;
}

const defaultBooking: BookingType = {
  id: 0, // This will be replaced with a generated ID when saved
  customer: "",
  phone: "",
  service: "",
  time: "9:00 AM",
  duration: 30,
  car: "",
  status: "pending"
};

const NewBookingModal: React.FC<NewBookingModalProps> = ({ isOpen, onClose, onSave }) => {
  const [newBooking, setNewBooking] = useState<BookingType>({...defaultBooking});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBooking((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "duration") {
      setNewBooking((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setNewBooking((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a random ID for the new booking
    const bookingWithId = {
      ...newBooking,
      id: Date.now()
    };
    onSave(bookingWithId);
    setNewBooking({...defaultBooking}); // Reset form
  };

  const handleCloseModal = () => {
    setNewBooking({...defaultBooking}); // Reset form
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
              <Label htmlFor="service" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Service
              </Label>
              <Input
                id="service"
                name="service"
                value={newBooking.service}
                onChange={handleChange}
                required
              />
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
                  onValueChange={(value) => handleSelectChange("status", value as "pending" | "confirmed")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                Duration (minutes)
              </Label>
              <Select 
                value={newBooking.duration.toString()} 
                onValueChange={(value) => handleSelectChange("duration", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
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
