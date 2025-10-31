-- Add Xero and MYOB invoice tracking columns to user_invoices table
ALTER TABLE user_invoices
ADD COLUMN IF NOT EXISTS xero_invoice_id TEXT,
ADD COLUMN IF NOT EXISTS myob_invoice_id TEXT,
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- Add index for faster lookups by xero_invoice_id
CREATE INDEX IF NOT EXISTS idx_user_invoices_xero_invoice_id ON user_invoices(xero_invoice_id);

-- Add index for faster lookups by myob_invoice_id
CREATE INDEX IF NOT EXISTS idx_user_invoices_myob_invoice_id ON user_invoices(myob_invoice_id);

-- Add comment to document the columns
COMMENT ON COLUMN user_invoices.xero_invoice_id IS 'Xero invoice ID for synced invoices';
COMMENT ON COLUMN user_invoices.myob_invoice_id IS 'MYOB invoice ID for synced invoices';
COMMENT ON COLUMN user_invoices.last_synced_at IS 'Timestamp of last successful sync with accounting system';