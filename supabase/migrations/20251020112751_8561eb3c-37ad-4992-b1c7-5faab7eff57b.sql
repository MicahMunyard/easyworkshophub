-- Create job_parts_requests table for tracking parts requests from technicians
CREATE TABLE IF NOT EXISTS public.job_parts_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  inventory_item_id UUID REFERENCES user_inventory_items(id) ON DELETE SET NULL,
  part_name TEXT NOT NULL,
  part_code TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_cost NUMERIC(10,2),
  total_cost NUMERIC(10,2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'fulfilled')),
  requested_by UUID NOT NULL, -- technician_id from user_technicians
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_by UUID, -- user_id who approved
  approved_at TIMESTAMP WITH TIME ZONE,
  denied_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_job_parts_requests_job_id ON public.job_parts_requests(job_id);
CREATE INDEX idx_job_parts_requests_status ON public.job_parts_requests(status);
CREATE INDEX idx_job_parts_requests_requested_by ON public.job_parts_requests(requested_by);

-- Enable RLS
ALTER TABLE public.job_parts_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Technicians can view their own requests (for jobs they're assigned to)
CREATE POLICY "Technicians can view their parts requests"
ON public.job_parts_requests
FOR SELECT
USING (
  requested_by IN (
    SELECT id FROM user_technicians WHERE id = requested_by
  )
);

-- Policy: Technicians can insert their own parts requests
CREATE POLICY "Technicians can create parts requests"
ON public.job_parts_requests
FOR INSERT
WITH CHECK (
  requested_by IN (
    SELECT id FROM user_technicians WHERE id = requested_by
  )
);

-- Policy: Admins (users who own the workshop) can view all parts requests for their technicians
CREATE POLICY "Admins can view all parts requests"
ON public.job_parts_requests
FOR SELECT
USING (
  requested_by IN (
    SELECT id FROM user_technicians WHERE user_id = auth.uid()
  )
);

-- Policy: Admins can update parts requests (approve/deny)
CREATE POLICY "Admins can update parts requests"
ON public.job_parts_requests
FOR UPDATE
USING (
  requested_by IN (
    SELECT id FROM user_technicians WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  requested_by IN (
    SELECT id FROM user_technicians WHERE user_id = auth.uid()
  )
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER update_job_parts_requests_updated_at
BEFORE UPDATE ON public.job_parts_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();