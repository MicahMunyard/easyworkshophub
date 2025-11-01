-- Create xero_account_mappings table to store chart of accounts configuration
CREATE TABLE IF NOT EXISTS public.xero_account_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Invoice-related account codes
  invoice_account_code TEXT,
  cash_payment_account_code TEXT,
  bank_payment_account_code TEXT,
  credit_account_code TEXT,
  
  -- Bill-related account codes
  bill_account_code TEXT,
  bill_cash_payment_account_code TEXT,
  bill_bank_payment_account_code TEXT,
  supplier_credit_account_code TEXT,
  
  -- Tax codes
  invoice_tax_code TEXT,
  invoice_tax_free_code TEXT,
  bill_tax_code TEXT,
  bill_tax_free_code TEXT,
  
  -- Tracking
  is_configured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- Create user_bills table for tracking expenses and purchases
CREATE TABLE IF NOT EXISTS public.user_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Bill details
  bill_number TEXT NOT NULL,
  supplier_id UUID REFERENCES public.user_inventory_suppliers(id),
  supplier_name TEXT NOT NULL,
  
  -- Dates
  bill_date DATE NOT NULL,
  due_date DATE,
  
  -- Amounts
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Category
  expense_type TEXT, -- 'stock', 'marketing', 'supplies', 'other'
  
  -- Notes
  notes TEXT,
  
  -- Xero sync
  xero_bill_id TEXT,
  xero_synced_at TIMESTAMP WITH TIME ZONE,
  last_sync_error TEXT,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_bill_items table for bill line items
CREATE TABLE IF NOT EXISTS public.user_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID NOT NULL REFERENCES public.user_bills(id) ON DELETE CASCADE,
  
  -- Item details
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  
  -- Optional inventory link
  inventory_item_id UUID REFERENCES public.user_inventory_items(id),
  
  -- Xero account code override
  account_code TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create xero_sync_queue table for tracking pending sync operations
CREATE TABLE IF NOT EXISTS public.xero_sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync details
  resource_type TEXT NOT NULL, -- 'invoice', 'payment', 'bill', 'bill_payment', 'customer', 'supplier', 'inventory'
  resource_id UUID NOT NULL,
  operation TEXT NOT NULL, -- 'create', 'update', 'delete'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Error tracking
  last_error TEXT,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  
  -- Payload
  payload JSONB,
  
  -- Tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create xero_sync_history table for audit trail
CREATE TABLE IF NOT EXISTS public.xero_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sync details
  resource_type TEXT NOT NULL,
  resource_id UUID,
  operation TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL, -- 'success', 'error'
  
  -- Details
  xero_id TEXT,
  request_payload JSONB,
  response_data JSONB,
  error_message TEXT,
  
  -- Tracking
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for xero_account_mappings
ALTER TABLE public.xero_account_mappings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own account mappings"
  ON public.xero_account_mappings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own account mappings"
  ON public.xero_account_mappings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own account mappings"
  ON public.xero_account_mappings FOR UPDATE
  USING (auth.uid() = user_id);

-- Add RLS policies for user_bills
ALTER TABLE public.user_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bills"
  ON public.user_bills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills"
  ON public.user_bills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
  ON public.user_bills FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
  ON public.user_bills FOR DELETE
  USING (auth.uid() = user_id);

-- Add RLS policies for user_bill_items
ALTER TABLE public.user_bill_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bill items"
  ON public.user_bill_items FOR SELECT
  USING (bill_id IN (SELECT id FROM public.user_bills WHERE user_id = auth.uid()));

CREATE POLICY "Users can create their own bill items"
  ON public.user_bill_items FOR INSERT
  WITH CHECK (bill_id IN (SELECT id FROM public.user_bills WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own bill items"
  ON public.user_bill_items FOR UPDATE
  USING (bill_id IN (SELECT id FROM public.user_bills WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete their own bill items"
  ON public.user_bill_items FOR DELETE
  USING (bill_id IN (SELECT id FROM public.user_bills WHERE user_id = auth.uid()));

-- Add RLS policies for xero_sync_queue
ALTER TABLE public.xero_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync queue"
  ON public.xero_sync_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Add RLS policies for xero_sync_history
ALTER TABLE public.xero_sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sync history"
  ON public.xero_sync_history FOR SELECT
  USING (auth.uid() = user_id);

-- Add updated_at trigger for xero_account_mappings
CREATE TRIGGER update_xero_account_mappings_updated_at
  BEFORE UPDATE ON public.xero_account_mappings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for user_bills
CREATE TRIGGER update_user_bills_updated_at
  BEFORE UPDATE ON public.user_bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_xero_account_mappings_user_id ON public.xero_account_mappings(user_id);
CREATE INDEX idx_user_bills_user_id ON public.user_bills(user_id);
CREATE INDEX idx_user_bills_status ON public.user_bills(status);
CREATE INDEX idx_user_bills_xero_bill_id ON public.user_bills(xero_bill_id);
CREATE INDEX idx_user_bill_items_bill_id ON public.user_bill_items(bill_id);
CREATE INDEX idx_xero_sync_queue_user_id ON public.xero_sync_queue(user_id);
CREATE INDEX idx_xero_sync_queue_status ON public.xero_sync_queue(status);
CREATE INDEX idx_xero_sync_history_user_id ON public.xero_sync_history(user_id);
CREATE INDEX idx_xero_sync_history_resource ON public.xero_sync_history(resource_type, resource_id);