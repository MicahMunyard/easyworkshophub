
export interface ServiceReminderType {
  id: string;
  vehicle: string;
  service_type: string;
  due_date: string;
  status: "pending" | "sent" | "completed" | "cancelled";
  notes?: string;
  customer_id: string; // Changed from number to string
  vehicle_info: string;
  reminder_text?: string;
  notification_method?: string[];
}

export interface ServiceRemindersProps {
  customerId: string; // Changed from number to string
  customerVehicles: string[] | undefined;
}

export interface AddReminderFormProps {
  customerId: string; // Changed from number to string
  customerVehicles: string[] | undefined;
  onReminderAdded: () => void;
  onCancel: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddReminder?: (reminderData: Omit<ServiceReminderType, "id" | "created_at" | "last_sent_at"> & { customer_id: string }) => Promise<void>;
}

export interface ReminderCardProps {
  reminder: ServiceReminderType;
  onStatusChange: (id: string, newStatus: "pending" | "sent" | "completed" | "cancelled") => void;
  onDelete?: (reminderId: string) => Promise<void>;
  onUpdateStatus?: (reminderId: string, status: "pending" | "sent" | "completed" | "cancelled") => Promise<void>;
}
