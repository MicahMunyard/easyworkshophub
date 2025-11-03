
export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive";
  lastVisit?: string;
  totalBookings: number;
  vehicleInfo?: string[];
  totalSpending?: number; // New field to track total spending
}

export interface BookingHistoryItem {
  id: number;
  bookingId: string;
  date: string;
  service: string;
  vehicle: string;
  cost: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  mechanic?: string;
  notes?: string;
  duration?: number;
  invoiceId?: string;
  invoiceTotal?: number;
  invoiceItems?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface CustomerDetailType extends CustomerType {
  bookingHistory: BookingHistoryItem[];
}
