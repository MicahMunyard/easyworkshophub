
export interface EmailType {
  id: string;
  subject: string;
  from: string;
  sender_email: string;
  date: string;
  content: string;
  is_booking_email: boolean;
  booking_created: boolean;
  extracted_details?: {
    name: string | null;
    phone: string | null;
    date: string | null;
    time: string | null;
    service: string | null;
    vehicle: string | null;
  };
}
