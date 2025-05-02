export type JobStatus = "pending" | "accepted" | "working" | "inProgress" | "completed" | "finished" | "cancelled" | "declined";

export interface TechnicianJob {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  status: JobStatus;
  date: string;
  time?: string;
  priority: string;
  notes?: string;
  assignedTo?: string;
  technicianId?: string;
}
