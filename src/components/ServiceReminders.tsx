
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import ReminderList from "./service-reminders/ReminderList";
import AddReminderForm from "./service-reminders/AddReminderForm";
import { useServiceReminders } from "./service-reminders/useServiceReminders";
import { ServiceRemindersProps } from "./service-reminders/types";

const ServiceReminders: React.FC<ServiceRemindersProps> = ({ customerId, customerVehicles = [] }) => {
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const { 
    reminders, 
    isLoading,
    addReminder, 
    deleteReminder, 
    updateReminderStatus 
  } = useServiceReminders(customerId);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-medium">Service Reminders</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingReminder(true)}
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Reminder</span>
        </Button>
      </div>

      <ReminderList
        reminders={reminders}
        isLoading={isLoading}
        onDelete={deleteReminder}
        onUpdateStatus={updateReminderStatus}
      />

      <AddReminderForm
        isOpen={isAddingReminder}
        onOpenChange={setIsAddingReminder}
        customerVehicles={customerVehicles}
        onAddReminder={addReminder}
        customerId={customerId}
      />
    </div>
  );
};

export default ServiceReminders;
