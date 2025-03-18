
export interface BookingType {
  id: number;
  customer: string;
  phone: string;
  service: string;
  time: string;
  duration: number;
  car: string;
  status: "pending" | "confirmed";
}
