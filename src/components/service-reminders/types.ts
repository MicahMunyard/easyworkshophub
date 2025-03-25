
export interface ServiceReminderType {
  id: string;
  vehicle_info: string;
  service_type: string;
  due_date: string;
  status: "pending" | "sent" | "completed" | "cancelled";
  customer_id: string; // Changed from number to string to match usage in components
  reminder_text?: string;
  notification_method?: string[];
  created_at?: string;
  last_sent_at?: string;
  // Removed notes property as it doesn't exist in the database
}

export interface ServiceRemindersProps {
  customerId: string;
  customerVehicles: string[] | undefined;
}

export interface AddReminderFormProps {
  customerId: string;
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

export interface ReminderListProps {
  reminders: ServiceReminderType[];
  isLoading: boolean;
  onDelete?: (reminderId: string) => Promise<void>;
  onUpdateStatus?: (reminderId: string, status: "pending" | "sent" | "completed" | "cancelled") => Promise<void>;
}
