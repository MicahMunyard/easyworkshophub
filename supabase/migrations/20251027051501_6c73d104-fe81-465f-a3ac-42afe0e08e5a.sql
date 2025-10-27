-- Add Western Industrial Cleaning Suppliers as a default supplier
INSERT INTO user_inventory_suppliers (
  id,
  name,
  category,
  contactperson,
  email,
  phone,
  address,
  status,
  isdefault,
  user_id,
  notes,
  logourl,
  connectiontype,
  created_at,
  updated_at
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-ef2345678901'::uuid,
  'Western Industrial Cleaning Suppliers',
  'Cleaning Supplies',
  'WICS Team',
  'info@wics.com.au',
  '(08) 9000 0000',
  NULL,
  'active',
  true,
  NULL,
  'Premium industrial cleaning supplies and equipment',
  '/lovable-uploads/wics-logo.png',
  'manual',
  now(),
  now()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  contactperson = EXCLUDED.contactperson,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  notes = EXCLUDED.notes,
  logourl = EXCLUDED.logourl,
  status = EXCLUDED.status,
  updated_at = now();