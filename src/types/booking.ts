
export type BookingType = {
  id: number | string;
  customer: string;
  phone: string;
  email?: string;
  service: string;
  time: string;
  duration: number;
  car: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  date: string;
  notes?: string;
  technician_id?: string | null;
  service_id?: string | null;
  bay_id?: string | null;
  cost?: number;
  // Add vehicle details
  vehicleDetails?: {
    make?: string;
    model?: string;
    modelDescription?: string;  // Added this field
    year?: string;
    vin?: string;
    color?: string;
    bodyType?: string;
    plateNumber?: string;
    state?: string;
  };
};
