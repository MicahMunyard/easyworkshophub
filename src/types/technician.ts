
export type JobStatus = 'pending' | 'accepted' | 'inProgress' | 'working' | 'completed' | 'declined' | 'cancelled';

export interface TechnicianProfile {
  id: string;
  name: string;
  specialty: string | null;
  experience: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface JobPhoto {
  id: string;
  url: string;
  uploaded_at: string;
  caption?: string;
}

export interface JobNote {
  id: string;
  content: string;
  created_at: string;
  author: string;
}

export interface PartRequest {
  id: string;
  name: string;
  quantity: number;
  status: 'pending' | 'approved' | 'denied' | 'delivered';
  requested_at: string;
  approved_at?: string;
  delivered_at?: string;
}

export interface TimeLog {
  id: string;
  jobId: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
  notes?: string;
}

export interface TechnicianJob {
  id: string;
  title: string;
  description?: string;
  customer: string;
  vehicle: string;
  status: JobStatus;
  assignedAt: string;
  scheduledFor?: string;
  estimatedTime?: string;
  priority: string;
  timeLogged: number; // in seconds
  partsRequested: PartRequest[];
  photos: JobPhoto[];
  notes: JobNote[];
  isActive: boolean;
}
