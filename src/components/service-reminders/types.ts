
export interface ServiceReminder {
  id: string;
  vehicle_info: string;
  service_type: string;
  due_date: string;
  status: 'pending' | 'sent' | 'completed' | 'cancelled';
  notification_method: string[];
  created_at: string;
  last_sent_at?: string;
  reminder_text?: string;
}

export interface ServiceRemindersProps {
  customerId: number;
  customerVehicles?: string[];
}

export interface ReminderCardProps {
  reminder: ServiceReminder;
  onDelete: (reminderId: string) => Promise<void>;
  onUpdateStatus: (reminderId: string, status: 'pending' | 'sent' | 'completed' | 'cancelled') => Promise<void>;
}

export interface AddReminderFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  customerVehicles: string[];
  onAddReminder: (reminderData: Omit<ServiceReminder, 'id' | 'created_at' | 'last_sent_at'> & { customer_id: number }) => Promise<void>;
  customerId: number;
}
