-- Add Halowipers as a default supplier
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
  'c3d4e5f6-a7b8-9012-cdef-ab3456789012'::uuid,
  'Halowipers',
  'Automotive Parts',
  'Halowipers Team',
  'info@halowipers.com.au',
  '(08) 9000 0001',
  NULL,
  'active',
  true,
  NULL,
  'Premium automotive wiper blades and accessories',
  '/lovable-uploads/halowipers-logo.png',
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