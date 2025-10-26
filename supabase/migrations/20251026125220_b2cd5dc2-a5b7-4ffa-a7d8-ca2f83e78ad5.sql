-- Add retail_price column to user_inventory_items
ALTER TABLE user_inventory_items 
ADD COLUMN IF NOT EXISTS retail_price numeric;

-- Add comments to clarify the difference between prices
COMMENT ON COLUMN user_inventory_items.price IS 'Wholesale/cost price paid to supplier';
COMMENT ON COLUMN user_inventory_items.retail_price IS 'Retail price charged to customer';

-- Update existing records to have retail_price = price * 1.5 (50% markup as default)
UPDATE user_inventory_items 
SET retail_price = COALESCE(price, 0) * 1.5 
WHERE retail_price IS NULL;