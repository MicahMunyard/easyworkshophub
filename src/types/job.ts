
export interface JobType {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  status: "pending" | "inProgress" | "working" | "completed" | "cancelled";
  assignedTo: string;
  date: string;
  time?: string; // Add optional time field
  timeEstimate: string;
  priority: string;
}
