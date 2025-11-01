-- Add Xero contact ID tracking to customers table
ALTER TABLE user_customers 
ADD COLUMN IF NOT EXISTS xero_contact_id TEXT,
ADD COLUMN IF NOT EXISTS xero_synced_at TIMESTAMP WITH TIME ZONE;

-- Add Xero contact ID tracking to suppliers table
ALTER TABLE user_inventory_suppliers 
ADD COLUMN IF NOT EXISTS xero_contact_id TEXT,
ADD COLUMN IF NOT EXISTS xero_synced_at TIMESTAMP WITH TIME ZONE;

-- Add Xero item ID tracking to inventory items table
ALTER TABLE user_inventory_items 
ADD COLUMN IF NOT EXISTS xero_item_id TEXT,
ADD COLUMN IF NOT EXISTS xero_synced_at TIMESTAMP WITH TIME ZONE;

-- Add inventory-related account codes to account mappings
ALTER TABLE xero_account_mappings
ADD COLUMN IF NOT EXISTS inventory_asset_account_code TEXT,
ADD COLUMN IF NOT EXISTS inventory_cogs_account_code TEXT,
ADD COLUMN IF NOT EXISTS inventory_sales_account_code TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_customers_xero_contact_id ON user_customers(xero_contact_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_suppliers_xero_contact_id ON user_inventory_suppliers(xero_contact_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_items_xero_item_id ON user_inventory_items(xero_item_id);

-- Create index on user_id for faster filtering
CREATE INDEX IF NOT EXISTS idx_user_customers_user_id ON user_customers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_inventory_suppliers_user_id ON user_inventory_suppliers(user_id) WHERE user_id IS NOT NULL;