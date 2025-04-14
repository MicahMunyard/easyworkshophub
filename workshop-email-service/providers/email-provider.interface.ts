
export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  sender_email: string;
  date: string;
  content: string;
  is_booking_email?: boolean;
  booking_created?: boolean;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_details?: {
    name: string | null;
    phone: string | null;
    date: string | null;
    time: string | null;
    service: string | null;
    vehicle: string | null;
  };
}

export interface EmailProviderInterface {
  connect(): Promise<boolean>;
  disconnect(): Promise<boolean>;
  fetchEmails(limit?: number): Promise<EmailMessage[]>;
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
}
