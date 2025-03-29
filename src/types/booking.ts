
export interface BookingType {
  id: number;
  customer: string;
  phone: string;
  email?: string;
  service: string;
  time: string;
  duration: number;
  car: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string; // Date in YYYY-MM-DD format
  notes?: string;
  cost?: number;
  
  // New additions for Supabase integration
  technician_id?: string | null;
  service_id?: string | null;
  bay_id?: string | null;
}
