
export interface EmailAttachment {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId: string;
  messageId: string;
}

export interface EmailType {
  id: string;
  subject: string;
  from: string;
  sender_email: string;
  date: string;
  content: string;
  is_booking_email: boolean;
  booking_created: boolean;
  processing_status?: 'pending' | 'processing' | 'completed' | 'failed';
  extracted_details?: ExtractedDetails;
  attachments?: EmailAttachment[];
}

export interface ExtractedDetails {
  name: string | null;
  phone: string | null;
  date: string | null;
  time: string | null;
  service: string | null;
  vehicle: string | null;
}

export interface EmailConnectionConfig {
  provider: string;
  host: string;
  port: number;
  secure: boolean;
}
