
export interface ServiceReminderType {
  id: string;
  vehicle: string;
  service_type: string;
  due_date: string;
  status: "pending" | "sent" | "completed" | "cancelled";
  notes?: string;
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
}

export interface ReminderCardProps {
  reminder: ServiceReminderType;
  onStatusChange: (id: string, newStatus: "pending" | "sent" | "completed" | "cancelled") => void;
}
