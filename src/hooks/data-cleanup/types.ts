
// Define a type for our table names with literal type strings
export type TableName = 
  | "user_bookings"
  | "user_jobs"
  | "user_inventory_items"
  | "service_bays"
  | "technicians"
  | "services"
  | "service_reminders";

export type CleanupResult = { 
  table: string; 
  deleted: number 
};

export type CleanupResponse = {
  success: boolean;
  results: CleanupResult[];
};
