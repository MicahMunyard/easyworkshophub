
export interface TimeEntry {
  id: string;
  job_id: string;
  technician_id: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  notes?: string;
  date: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
}

export interface TimeEntryFormData {
  notes?: string;
  date: string;
}
