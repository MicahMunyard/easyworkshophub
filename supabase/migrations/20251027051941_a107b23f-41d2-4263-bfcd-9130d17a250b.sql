-- Remove duplicate suppliers without logos
DELETE FROM user_inventory_suppliers 
WHERE id IN (
  'd12b7966-bc17-4b6d-8b4d-ef8c83d40405'::uuid,  -- Halowipers without logo
  'cfae14e9-853f-4ae8-a1fc-6bf971c7a3c0'::uuid   -- Western Industrial Cleaning Suppliers without logo
);