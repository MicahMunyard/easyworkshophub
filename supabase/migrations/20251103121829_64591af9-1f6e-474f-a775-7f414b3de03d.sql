-- Phase 1: Add Unit of Measure Support to Inventory Items
ALTER TABLE user_inventory_items
ADD COLUMN unit_of_measure TEXT DEFAULT 'unit' CHECK (unit_of_measure IN ('unit', 'litre', 'ml', 'kg', 'g')),
ADD COLUMN is_bulk_product BOOLEAN DEFAULT false,
ADD COLUMN bulk_quantity NUMERIC;

-- Add constraint: bulk_quantity must be positive if is_bulk_product is true
ALTER TABLE user_inventory_items
ADD CONSTRAINT check_bulk_quantity 
CHECK (
  (is_bulk_product = false) OR 
  (is_bulk_product = true AND bulk_quantity IS NOT NULL AND bulk_quantity > 0)
);

-- Phase 1: Link Invoice Items to Inventory
ALTER TABLE user_invoice_items
ADD COLUMN inventory_item_id UUID REFERENCES user_inventory_items(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_invoice_items_inventory ON user_invoice_items(inventory_item_id);

-- Phase 1: Create Inventory Transactions Table for Audit Trail
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES user_inventory_items(id) ON DELETE CASCADE,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('invoice', 'job', 'manual_adjustment', 'purchase', 'initial_stock')),
  reference_id UUID,
  quantity_change NUMERIC NOT NULL,
  quantity_after NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_transactions_inventory_item ON inventory_transactions(inventory_item_id);
CREATE INDEX idx_transactions_reference ON inventory_transactions(reference_type, reference_id);
CREATE INDEX idx_transactions_user ON inventory_transactions(user_id);
CREATE INDEX idx_transactions_created_at ON inventory_transactions(created_at DESC);

-- Enable RLS on inventory_transactions
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_transactions
CREATE POLICY "Users can view their own inventory transactions"
ON inventory_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inventory transactions"
ON inventory_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory transactions"
ON inventory_transactions FOR UPDATE
USING (auth.uid() = user_id);

-- Add comment for documentation
COMMENT ON TABLE inventory_transactions IS 'Audit trail for all inventory movements including sales, purchases, and adjustments';
COMMENT ON COLUMN user_inventory_items.unit_of_measure IS 'Unit of measure: unit (default), litre, ml, kg, g';
COMMENT ON COLUMN user_inventory_items.is_bulk_product IS 'Flag indicating if this is a bulk product (e.g., 20L drum)';
COMMENT ON COLUMN user_inventory_items.bulk_quantity IS 'Capacity per unit for bulk products (e.g., 20 for 20L drum)';