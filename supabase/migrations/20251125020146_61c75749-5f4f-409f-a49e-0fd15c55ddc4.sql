-- Phase 1: Create Subscription Tier System

-- 1.1 Create enum for subscription tiers
CREATE TYPE subscription_tier AS ENUM ('tier1', 'tier2');

COMMENT ON TYPE subscription_tier IS 'Subscription tiers: tier1 (Starter - Bookings, CRM, Oil Monitor) | tier2 (Full Access - All Features)';

-- 1.2 Update profiles table with tier columns
ALTER TABLE profiles 
ADD COLUMN subscription_tier subscription_tier DEFAULT 'tier1',
ADD COLUMN tier_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN tier_updated_by UUID REFERENCES auth.users(id);

COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier: tier1 (Starter) or tier2 (Full Access)';
COMMENT ON COLUMN profiles.tier_updated_at IS 'Timestamp when tier was last changed';
COMMENT ON COLUMN profiles.tier_updated_by IS 'Admin user_id who changed the tier';

-- Create index for performance
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- Set all existing users to tier2 to maintain current access
UPDATE profiles 
SET subscription_tier = 'tier2', 
    tier_updated_at = NOW()
WHERE subscription_tier IS NULL;

-- 1.3 Create tier_features table
CREATE TABLE tier_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier NOT NULL,
  feature_key TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tier, feature_key)
);

COMMENT ON TABLE tier_features IS 'Defines which features are enabled for each subscription tier';

-- Enable RLS on tier_features
ALTER TABLE tier_features ENABLE ROW LEVEL SECURITY;

-- Public read access (needed for UI to check feature availability)
CREATE POLICY "Anyone can view tier features"
  ON tier_features FOR SELECT
  TO authenticated
  USING (true);

-- Insert tier configuration
INSERT INTO tier_features (tier, feature_key, feature_name, enabled) VALUES
  -- Tier 1: Starter Features (Bookings, CRM, Oil Monitor)
  ('tier1', 'dashboard', 'Dashboard', true),
  ('tier1', 'bookings', 'Booking System', true),
  ('tier1', 'customers', 'Customer CRM', true),
  ('tier1', 'oil_dispensary', 'Oil Dispensary Monitor', true),
  ('tier1', 'invoicing', 'Invoicing', false),
  ('tier1', 'email', 'Email Integration', false),
  ('tier1', 'communication', 'Social Media', false),
  ('tier1', 'inventory', 'Inventory Management', false),
  ('tier1', 'marketing', 'Marketing Tools', false),
  ('tier1', 'reports', 'Reports & Analytics', false),
  ('tier1', 'timesheets', 'Timesheets', false),
  ('tier1', 'ezyparts', 'EzyParts Integration', false),
  
  -- Tier 2: Full Access (All Features)
  ('tier2', 'dashboard', 'Dashboard', true),
  ('tier2', 'bookings', 'Booking System', true),
  ('tier2', 'customers', 'Customer CRM', true),
  ('tier2', 'oil_dispensary', 'Oil Dispensary Monitor', true),
  ('tier2', 'invoicing', 'Invoicing', true),
  ('tier2', 'email', 'Email Integration', true),
  ('tier2', 'communication', 'Social Media', true),
  ('tier2', 'inventory', 'Inventory Management', true),
  ('tier2', 'marketing', 'Marketing Tools', true),
  ('tier2', 'reports', 'Reports & Analytics', true),
  ('tier2', 'timesheets', 'Timesheets', true),
  ('tier2', 'ezyparts', 'EzyParts Integration', true);

-- 1.4 Create helper function to check feature access
CREATE OR REPLACE FUNCTION has_feature_access(
  _user_id UUID,
  _feature_key TEXT
)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN tier_features tf ON tf.tier = p.subscription_tier
    WHERE p.user_id = _user_id
      AND tf.feature_key = _feature_key
      AND tf.enabled = true
      AND p.account_status = 'approved'
  )
$$;

COMMENT ON FUNCTION has_feature_access IS 'Check if user has access to a specific feature based on their subscription tier';

-- 1.5 Create admin management view
CREATE OR REPLACE VIEW user_tier_overview AS
SELECT 
  p.user_id,
  p.full_name,
  p.workshop_name,
  p.username,
  p.subscription_tier,
  p.account_status,
  p.tier_updated_at,
  p.tier_updated_by,
  admin.full_name as tier_updated_by_name,
  p.created_at,
  p.onboarding_completed
FROM profiles p
LEFT JOIN profiles admin ON admin.user_id = p.tier_updated_by
WHERE p.account_status IN ('approved', 'pending_approval')
ORDER BY p.created_at DESC;

COMMENT ON VIEW user_tier_overview IS 'Admin view showing all users with their subscription tiers and status';

-- 1.6 Create trigger to auto-update tier metadata
CREATE OR REPLACE FUNCTION update_tier_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier THEN
    NEW.tier_updated_at = NOW();
    NEW.tier_updated_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_tier_update
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_tier_metadata();

-- Phase 4: Add RLS Policies for Tier-Based Access

-- Invoicing tables (tier2 required)
DROP POLICY IF EXISTS "Users can view their own invoices" ON user_invoices;
DROP POLICY IF EXISTS "Users can create their own invoices" ON user_invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON user_invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON user_invoices;

CREATE POLICY "Tier 2 users can manage invoices"
  ON user_invoices
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND has_feature_access(auth.uid(), 'invoicing'))
  WITH CHECK (user_id = auth.uid() AND has_feature_access(auth.uid(), 'invoicing'));

-- Email connections (tier2 required)
DROP POLICY IF EXISTS "Users can view their own email connections" ON email_connections;
DROP POLICY IF EXISTS "Users can create their own email connections" ON email_connections;
DROP POLICY IF EXISTS "Users can insert their own email connections" ON email_connections;
DROP POLICY IF EXISTS "Users can update their own email connections" ON email_connections;
DROP POLICY IF EXISTS "Users can delete their own email connections" ON email_connections;

CREATE POLICY "Tier 2 users can manage email connections"
  ON email_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND has_feature_access(auth.uid(), 'email'))
  WITH CHECK (user_id = auth.uid() AND has_feature_access(auth.uid(), 'email'));

-- Social connections (tier2 required)
DROP POLICY IF EXISTS "Users can view their own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can insert their own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can update their own social connections" ON social_connections;
DROP POLICY IF EXISTS "Users can delete their own social connections" ON social_connections;

CREATE POLICY "Tier 2 users can manage social connections"
  ON social_connections
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND has_feature_access(auth.uid(), 'communication'))
  WITH CHECK (user_id = auth.uid() AND has_feature_access(auth.uid(), 'communication'));

-- Inventory (tier2 required)
DROP POLICY IF EXISTS "Users can view their own inventory items" ON user_inventory_items;
DROP POLICY IF EXISTS "Users can create their own inventory items" ON user_inventory_items;
DROP POLICY IF EXISTS "Users can update their own inventory items" ON user_inventory_items;
DROP POLICY IF EXISTS "Users can delete their own inventory items" ON user_inventory_items;

CREATE POLICY "Tier 2 users can manage inventory"
  ON user_inventory_items
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND has_feature_access(auth.uid(), 'inventory'))
  WITH CHECK (user_id = auth.uid() AND has_feature_access(auth.uid(), 'inventory'));

-- Timesheets (tier2 required)
DROP POLICY IF EXISTS "Users can view their time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can create time entries" ON time_entries;
DROP POLICY IF EXISTS "Users can update time entries" ON time_entries;

CREATE POLICY "Tier 2 users can manage timesheets"
  ON time_entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid() AND has_feature_access(auth.uid(), 'timesheets'))
  WITH CHECK (user_id = auth.uid() AND has_feature_access(auth.uid(), 'timesheets'));