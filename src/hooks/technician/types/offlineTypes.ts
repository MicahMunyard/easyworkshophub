
import { JobStatus, TimeLog, PartRequest } from "@/types/technician";

// Queue for storing operations when offline
export interface OfflineOperation {
  id: string;
  type: 'status_update' | 'time_log' | 'photo_upload' | 'parts_request';
  data: any;
  timestamp: string;
}

export interface StatusUpdateData {
  jobId: string;
  newStatus: JobStatus;
}

export interface TimeLogData extends TimeLog {}

export interface PhotoUploadData {
  jobId: string;
  fileName: string;
}

export interface PartRequestData {
  jobId: string;
  parts: { name: string; quantity: number }[];
}
