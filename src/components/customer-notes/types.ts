
export interface CustomerNote {
  id: string;
  note: string;
  created_at: string;
  created_by?: string;
  updated_at?: string;
}

export interface CustomerNotesProps {
  customerId: string;
}
