-- Add missing columns to user_inventory_suppliers table
ALTER TABLE user_inventory_suppliers 
ADD COLUMN IF NOT EXISTS logourl TEXT,
ADD COLUMN IF NOT EXISTS connectiontype TEXT DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS apiconfig JSONB;

-- Update existing suppliers to have manual connection type
UPDATE user_inventory_suppliers 
SET connectiontype = 'manual' 
WHERE connectiontype IS NULL;

-- Insert Burson Auto Parts as a default supplier (visible to all users)
INSERT INTO user_inventory_suppliers (
  id, 
  name, 
  category, 
  contactperson, 
  email, 
  phone, 
  status, 
  isdefault, 
  user_id, 
  notes,
  logourl,
  connectiontype,
  apiconfig
) VALUES (
  '145eeddc-5b99-42d1-b413-e513cf014c7d',
  'Burson Auto Parts',
  'Auto Parts',
  'EzyParts Support',
  'ezypartssupport@bapcor.com.au',
  '1300 650 590',
  'active',
  true,
  NULL,
  'Official Burson Auto Parts integration via EzyParts API',
  '/lovable-uploads/0ece5982-0f75-4154-ab1c-2d19e00f09a4.png',
  'api',
  '{"type": "bursons", "isConnected": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  logourl = EXCLUDED.logourl,
  connectiontype = EXCLUDED.connectiontype,
  apiconfig = EXCLUDED.apiconfig,
  isdefault = true,
  user_id = NULL;

-- Update all Burson products to use the standardized supplier ID
UPDATE user_inventory_items
SET 
  supplier_id = '145eeddc-5b99-42d1-b413-e513cf014c7d',
  supplier = 'Burson Auto Parts'
WHERE 
  supplier_id IN (
    'ezyparts-burson', 
    'burson-auto-parts', 
    'cfaf6896-f2db-46bb-a3aa-87348f836324',
    'accd1bde-37fc-4d95-86fa-044cbad29552'
  )
  OR (supplier ILIKE '%burson%' AND supplier_id != '145eeddc-5b99-42d1-b413-e513cf014c7d');