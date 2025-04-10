
export interface JobType {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  status: "pending" | "inProgress" | "working" | "completed" | "cancelled";
  assignedTo: string;
  date: string;
  time?: string; // Time field is optional
  timeEstimate: string;
  priority: string;
  cost?: number; // Added cost field as optional
}
