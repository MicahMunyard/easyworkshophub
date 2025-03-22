
import { TableName } from "./types";

// Define which tables have user_id columns
export const tablesWithUserId: TableName[] = [
  'user_bookings',
  'user_jobs',
  'user_inventory_items'
];

// Define tables that should be completely cleared for the current user
export const tablesToTruncate: TableName[] = [
  'service_bays',
  'technicians',
  'services',
  'service_reminders'
];
