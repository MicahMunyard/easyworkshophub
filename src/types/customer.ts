
export interface CustomerType {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: "active" | "inactive";
  lastVisit?: string;
  totalBookings: number;
  vehicleInfo?: string[];
}

export interface CustomerDetailType extends CustomerType {
  bookingHistory: {
    id: number;
    date: string;
    service: string;
    vehicle: string;
    cost: number;
    status: "pending" | "confirmed" | "completed" | "cancelled";
    mechanic?: string;
  }[];
}
