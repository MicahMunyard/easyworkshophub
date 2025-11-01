-- Add service role policy for accounting_integrations
-- This allows edge functions to manage Xero integration tokens
CREATE POLICY "Service role can manage accounting integrations"
ON accounting_integrations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Add comment explaining why this policy exists
COMMENT ON POLICY "Service role can manage accounting integrations" 
ON accounting_integrations 
IS 'Allows edge functions (running as service_role) to store OAuth tokens during Xero integration setup';