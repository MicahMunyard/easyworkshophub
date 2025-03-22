
export interface JobType {
  id: string;
  customer: string;
  vehicle: string;
  service: string;
  status: "pending" | "inProgress" | "working" | "completed" | "cancelled";
  assignedTo: string;
  date: string;
  timeEstimate: string;
  priority: string;
}
