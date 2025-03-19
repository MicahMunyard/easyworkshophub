import React from "react";
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
import { Car, Wrench, User, Phone, Clock, CalendarIcon } from "lucide-react";
import { BookingType } from "@/types/booking";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingType | null;
  onSave: (booking: BookingType) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, booking, onSave }) => {
  const [editedBooking, setEditedBooking] = React.useState<BookingType | null>(booking);
  const [date, setDate] = React.useState<Date | undefined>(
    booking?.date ? new Date(booking.date) : undefined
  );

  React.useEffect(() => {
    setEditedBooking(booking);
    setDate(booking?.date ? new Date(booking.date) : undefined);
  }, [booking]);

  if (!editedBooking) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBooking((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === "status") {
      const typedStatus = value as "pending" | "confirmed" | "cancelled" | "completed";
      setEditedBooking((prev) => prev ? { ...prev, status: typedStatus } : null);
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
      onSave(editedBooking);
    }
  };

  return (
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
              <Label htmlFor="service" className="flex items-center gap-2">
                <Wrench className="h-4 w-4" /> Service
              </Label>
              <Input
                id="service"
                name="service"
                value={editedBooking.service}
                onChange={handleChange}
              />
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
            
            <div className="grid gap-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                Duration (minutes)
              </Label>
              <Select 
                value={editedBooking.duration.toString()} 
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
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
