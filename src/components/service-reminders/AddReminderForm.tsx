
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { AddReminderFormProps } from "./types";

const AddReminderForm: React.FC<AddReminderFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  customerVehicles, 
  onAddReminder,
  customerId 
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>(customerVehicles.length > 0 ? customerVehicles[0] : '');
  const [serviceType, setServiceType] = useState<string>('');
  const [reminderText, setReminderText] = useState<string>('');
  const [notificationMethods, setNotificationMethods] = useState<string[]>(['email']);

  const commonServiceTypes = [
    "Oil Change",
    "Tire Rotation",
    "Brake Inspection",
    "Annual Service",
    "MOT",
    "Air Filter Replacement",
    "Spark Plug Replacement"
  ];

  const resetForm = () => {
    setSelectedVehicle(customerVehicles.length > 0 ? customerVehicles[0] : '');
    setServiceType('');
    setReminderText('');
    setSelectedDate(new Date());
    setNotificationMethods(['email']);
    onOpenChange(false);
  };

  const handleAddReminder = async () => {
    if (!selectedVehicle.trim() || !serviceType.trim() || !selectedDate) {
      return;
    }

    await onAddReminder({
      customer_id: customerId,
      vehicle_info: selectedVehicle.trim(),
      service_type: serviceType.trim(),
      due_date: format(selectedDate, 'yyyy-MM-dd'),
      notification_method: notificationMethods,
      reminder_text: reminderText.trim() || undefined,
      status: 'pending'
    });

    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Service Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehicle-info" className="text-right">
              Vehicle
            </Label>
            {customerVehicles.length > 0 ? (
              <Select 
                value={selectedVehicle} 
                onValueChange={setSelectedVehicle}
              >
                <SelectTrigger id="vehicle-info" className="col-span-3">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {customerVehicles.map((vehicle, index) => (
                    <SelectItem key={index} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="vehicle-info"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="col-span-3"
                placeholder="Enter vehicle information"
              />
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="service-type" className="text-right">
              Service
            </Label>
            <div className="col-span-3">
              <Select 
                value={serviceType} 
                onValueChange={setServiceType}
              >
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  {commonServiceTypes.map((type, index) => (
                    <SelectItem key={index} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Service</SelectItem>
                </SelectContent>
              </Select>
              
              {serviceType === 'custom' && (
                <Input
                  className="mt-2"
                  value={serviceType === 'custom' ? '' : serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  placeholder="Enter custom service type"
                />
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="due-date" className="text-right">
              Due Date
            </Label>
            <div className="col-span-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="due-date"
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-0">
              Notification Method
            </Label>
            <div className="flex flex-col gap-2 col-span-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-email" 
                  checked={notificationMethods.includes('email')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNotificationMethods([...notificationMethods, 'email']);
                    } else {
                      setNotificationMethods(notificationMethods.filter(m => m !== 'email'));
                    }
                  }}
                />
                <Label htmlFor="notify-email" className="font-normal">Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="notify-sms" 
                  checked={notificationMethods.includes('sms')}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setNotificationMethods([...notificationMethods, 'sms']);
                    } else {
                      setNotificationMethods(notificationMethods.filter(m => m !== 'sms'));
                    }
                  }}
                />
                <Label htmlFor="notify-sms" className="font-normal">SMS</Label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="reminder-text" className="text-right pt-2">
              Reminder Text
            </Label>
            <Textarea
              id="reminder-text"
              value={reminderText}
              onChange={(e) => setReminderText(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Optional: Add custom text for this reminder..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetForm}>
            Cancel
          </Button>
          <Button onClick={handleAddReminder}>
            Save Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddReminderForm;
