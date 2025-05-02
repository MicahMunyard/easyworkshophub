
export type JobStatus = "pending" | "accepted" | "working" | "inProgress" | "completed" | "finished" | "cancelled" | "declined";

export interface JobNote {
  id: string;
  content: string;
  created_at: string;
  created_by?: string;
  author?: string;
}

export interface JobPhoto {
  id: string;
  url: string;
  uploaded_at: string;
  caption?: string;
}

export interface PartRequest {
  id: string;
  name: string;
  quantity: number;
  status: "pending" | "approved" | "denied" | "delivered";
  requested_at: string;
}

export interface TimeLog {
  id: string;
  jobId: string;
  technicianId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  notes?: string;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}

export interface TechnicianJob {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  status: JobStatus;
  date: string;
  time?: string;
  priority: string;
  notes?: JobNote[];
  assignedTo?: string;
  technicianId?: string;
  title?: string;
  description?: string;
  scheduledFor?: string;
  estimatedTime?: string;
  photos?: JobPhoto[];
  partsRequested?: PartRequest[];
  timeLogged?: number;
  isActive?: boolean;
}
