-- Create oil dispensary data table
CREATE TABLE IF NOT EXISTS oil_dispensary_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  bench_id TEXT,
  raw_payload JSONB NOT NULL,
  oil_type TEXT,
  current_level NUMERIC,
  capacity NUMERIC,
  unit TEXT,
  timestamp TIMESTAMPTZ,
  received_at TIMESTAMPTZ DEFAULT now(),
  processed BOOLEAN DEFAULT false,
  notes TEXT,
  source_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_oil_dispensary_user_id ON oil_dispensary_data(user_id);
CREATE INDEX idx_oil_dispensary_bench_id ON oil_dispensary_data(bench_id);
CREATE INDEX idx_oil_dispensary_timestamp ON oil_dispensary_data(timestamp);
CREATE INDEX idx_oil_dispensary_received_at ON oil_dispensary_data(received_at);

-- Enable RLS
ALTER TABLE oil_dispensary_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own oil dispensary data"
  ON oil_dispensary_data
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert oil dispensary data"
  ON oil_dispensary_data
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage their own oil dispensary data"
  ON oil_dispensary_data
  FOR ALL
  USING (auth.uid() = user_id);