-- Add TOLICCS Workshop Supplies as a default supplier
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'TOLICCS Workshop Supplies',
  'Workshop Supplies',
  'TOLICCS Team',
  'admin@toliccs.com.au',
  '(08) 9309 2998',
  NULL,
  'active',
  true,
  NULL,
  'Suppliers of TotalEnergies Oils & Lubricants, JLM Additives, Macnaught pumps and more!',
  '/lovable-uploads/toliccs-logo.png',
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