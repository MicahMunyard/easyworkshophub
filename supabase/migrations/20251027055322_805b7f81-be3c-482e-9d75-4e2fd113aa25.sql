-- Add order status tracking columns to user_inventory_items
ALTER TABLE user_inventory_items
ADD COLUMN IF NOT EXISTS order_status TEXT CHECK (order_status IN ('quoted', 'on_order', 'in_stock')),
ADD COLUMN IF NOT EXISTS ezyparts_quote_id UUID REFERENCES ezyparts_quotes(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS ezyparts_order_number TEXT,
ADD COLUMN IF NOT EXISTS quoted_quantity INTEGER,
ADD COLUMN IF NOT EXISTS ordered_quantity INTEGER,
ADD COLUMN IF NOT EXISTS order_date TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on order status
CREATE INDEX IF NOT EXISTS idx_inventory_order_status ON user_inventory_items(order_status) WHERE order_status IS NOT NULL;

-- Create index for ezyparts quote lookups
CREATE INDEX IF NOT EXISTS idx_inventory_ezyparts_quote ON user_inventory_items(ezyparts_quote_id) WHERE ezyparts_quote_id IS NOT NULL;