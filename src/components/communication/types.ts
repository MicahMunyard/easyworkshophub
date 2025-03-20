
export interface CommunicationLogEntryType {
  id: string;
  type: 'phone' | 'email' | 'sms';
  direction: 'inbound' | 'outbound';
  content?: string;
  timestamp: string;
  staff_member?: string;
  duration?: number;
  status?: string;
}

export interface CommunicationLogFormData {
  type: 'phone' | 'email' | 'sms';
  direction: 'inbound' | 'outbound';
  content?: string;
  duration?: number;
  staff_member?: string;
}

export interface CommunicationLogProps {
  customerId: number;
}
