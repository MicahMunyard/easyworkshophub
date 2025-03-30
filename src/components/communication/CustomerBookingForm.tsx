
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface CustomerBookingFormProps {
  customerName: string;
  customerPhone: string;
  onBooked: () => void;
  onCancel: () => void;
}

const CustomerBookingForm: React.FC<CustomerBookingFormProps> = ({
  customerName,
  customerPhone,
  onBooked,
  onCancel
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    duration: "60",
    car: "",
    notes: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleServiceChange = (value: string) => {
    setForm(prev => ({ ...prev, service: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_bookings')
        .insert({
          user_id: user.id,
          customer_name: customerName,
          customer_phone: customerPhone,
          service: form.service,
          booking_date: form.date,
          booking_time: form.time,
          duration: parseInt(form.duration),
          car: form.car,
          notes: form.notes,
          status: 'pending'
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: "Booking Created",
        description: "The appointment has been successfully booked."
      });
      
      onBooked();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        variant: "destructive",
        title: "Failed to create booking",
        description: "There was a problem creating the booking. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            name="date" 
            type="date" 
            value={form.date} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input 
            id="time" 
            name="time" 
            type="time" 
            value={form.time} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="service">Service</Label>
        <Select value={form.service} onValueChange={handleServiceChange} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Oil Change">Oil Change</SelectItem>
            <SelectItem value="Tire Rotation">Tire Rotation</SelectItem>
            <SelectItem value="Brake Service">Brake Service</SelectItem>
            <SelectItem value="Engine Tune-up">Engine Tune-up</SelectItem>
            <SelectItem value="Full Service">Full Service</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="car">Vehicle</Label>
        <Input 
          id="car" 
          name="car" 
          value={form.car} 
          onChange={handleChange} 
          placeholder="Year, Make, Model" 
          required 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Select value={form.duration} onValueChange={(val) => setForm(prev => ({ ...prev, duration: val }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">60 minutes</SelectItem>
            <SelectItem value="90">90 minutes</SelectItem>
            <SelectItem value="120">120 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Input 
          id="notes" 
          name="notes" 
          value={form.notes} 
          onChange={handleChange} 
          placeholder="Any special requests or additional information" 
        />
      </div>
      
      <div className="flex gap-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            "Book Appointment"
          )}
        </Button>
      </div>
    </form>
  );
};

export default CustomerBookingForm;
