
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AddReminderFormProps } from "./types";

// Import our new component modules
import VehicleSelector from "./form/VehicleSelector";
import ServiceTypeSelector from "./form/ServiceTypeSelector";
import DueDateSelector from "./form/DueDateSelector";
import NotificationMethodSelector from "./form/NotificationMethodSelector";
import ReminderTextInput from "./form/ReminderTextInput";

const AddReminderForm: React.FC<AddReminderFormProps> = ({ 
  isOpen, 
  onOpenChange, 
  customerVehicles, 
  onAddReminder,
  customerId,
  onReminderAdded,
  onCancel
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>(customerVehicles && customerVehicles.length > 0 ? customerVehicles[0] : '');
  const [serviceType, setServiceType] = useState<string>('');
  const [reminderText, setReminderText] = useState<string>('');
  const [notificationMethods, setNotificationMethods] = useState<string[]>(['email']);

  const resetForm = () => {
    setSelectedVehicle(customerVehicles && customerVehicles.length > 0 ? customerVehicles[0] : '');
    setServiceType('');
    setReminderText('');
    setSelectedDate(new Date());
    setNotificationMethods(['email']);
    onOpenChange(false);
    onCancel();
  };

  const handleAddReminder = async () => {
    if (!selectedVehicle.trim() || !serviceType.trim() || !selectedDate) {
      return;
    }

    if (onAddReminder) {
      await onAddReminder({
        customer_id: customerId,
        vehicle_info: selectedVehicle.trim(),
        service_type: serviceType.trim(),
        due_date: format(selectedDate, 'yyyy-MM-dd'),
        notification_method: notificationMethods,
        reminder_text: reminderText.trim() || undefined,
        status: 'pending'
        // Removed notes property as it doesn't exist in the database
      });
      
      onReminderAdded();
      resetForm();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Service Reminder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <VehicleSelector 
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
            customerVehicles={customerVehicles}
          />
          
          <ServiceTypeSelector
            serviceType={serviceType}
            setServiceType={setServiceType}
          />
          
          <DueDateSelector
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          
          <NotificationMethodSelector
            notificationMethods={notificationMethods}
            setNotificationMethods={setNotificationMethods}
          />
          
          <ReminderTextInput
            reminderText={reminderText}
            setReminderText={setReminderText}
          />
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
