export interface JobPartRequest {
  id: string;
  job_id: string;
  inventory_item_id: string | null;
  part_name: string;
  part_code: string | null;
  quantity: number;
  unit_cost: number | null;
  total_cost: number | null;
  status: 'pending' | 'approved' | 'denied' | 'fulfilled';
  requested_by: string; // technician_id
  requested_at: string;
  approved_by: string | null;
  approved_at: string | null;
  denied_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface JobPartRequestWithInventory extends JobPartRequest {
  inventory_item?: {
    id: string;
    name: string;
    code: string;
    in_stock: number;
    price: number;
    supplier: string;
  };
  technician?: {
    name: string;
  };
  job?: {
    customer: string;
    vehicle: string;
    service: string;
  };
}
