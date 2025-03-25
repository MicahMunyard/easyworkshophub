
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
