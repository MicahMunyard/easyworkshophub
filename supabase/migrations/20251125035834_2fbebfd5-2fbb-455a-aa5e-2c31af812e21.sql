-- Add customer_insights feature to tier_features
-- This feature controls access to customer analytics, engagement metrics, and insights

INSERT INTO tier_features (tier, feature_key, feature_name, enabled)
VALUES 
  ('tier1', 'customer_insights', 'Customer Insights & Analytics', false),
  ('tier2', 'customer_insights', 'Customer Insights & Analytics', true)
ON CONFLICT (tier, feature_key) 
DO UPDATE SET enabled = EXCLUDED.enabled;