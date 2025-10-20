
// This now represents data from user_bookings table
export interface JobType {
  id: string; // UUID from user_bookings
  customer: string; // customer_name
  vehicle: string; // car
  service: string;
  status: "pending" | "confirmed" | "inProgress" | "working" | "completed" | "cancelled";
  assignedTo: string; // technician_id (can be null)
  date: string; // booking_date
  time?: string; // booking_time
  timeEstimate: string; // time_estimate
  priority: string;
  cost?: number;
  duration?: number; // Duration in minutes
  customerPhone?: string; // customer_phone
  customerEmail?: string;
  notes?: string;
  totalTime?: number; // total_time in seconds
}
