-- Phase 1: Update user_bookings schema
ALTER TABLE user_bookings 
  ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS time_estimate TEXT,
  ADD COLUMN IF NOT EXISTS total_time INTEGER DEFAULT 0;

-- Update status column to support all job statuses (if needed, we'll use the existing text type)
-- Status values: 'pending', 'confirmed', 'inProgress', 'working', 'completed', 'cancelled'

-- Phase 2: Create temporary mapping table for job ID migration
CREATE TABLE IF NOT EXISTS job_id_mapping (
  old_job_id TEXT PRIMARY KEY,
  new_booking_id UUID NOT NULL
);

-- Phase 3: Migrate data from jobs to user_bookings
INSERT INTO user_bookings (
  user_id,
  customer_name,
  customer_phone,
  car,
  service,
  booking_date,
  booking_time,
  duration,
  status,
  technician_id,
  notes,
  priority,
  time_estimate,
  total_time,
  created_at,
  updated_at
)
SELECT 
  j.user_id,
  j.customer,
  '', -- customer_phone (not available in jobs table)
  j.vehicle,
  j.service,
  j.date::date,
  COALESCE(j.time, '09:00'), -- Default time if not set
  60, -- Default duration (jobs table doesn't have this)
  j.status,
  NULL, -- technician_id (jobs uses TEXT assigned_to, we'll need to map this separately)
  NULL, -- notes
  j.priority,
  j.time_estimate,
  COALESCE(j.total_time, 0),
  j.created_at,
  j.updated_at
FROM jobs j
WHERE NOT EXISTS (
  SELECT 1 FROM user_bookings ub 
  WHERE ub.customer_name = j.customer 
    AND ub.car = j.vehicle 
    AND ub.booking_date = j.date::date
    AND ub.user_id = j.user_id
)
RETURNING id;

-- Phase 4: Populate job_id_mapping (this will need to be done manually or via a function)
-- We'll create a mapping of old TEXT job IDs to new UUID booking IDs
INSERT INTO job_id_mapping (old_job_id, new_booking_id)
SELECT 
  j.id as old_job_id,
  ub.id as new_booking_id
FROM jobs j
JOIN user_bookings ub ON (
  ub.customer_name = j.customer 
  AND ub.car = j.vehicle 
  AND ub.booking_date = j.date::date
  AND ub.user_id = j.user_id
  AND ub.service = j.service
  AND ub.time_estimate = j.time_estimate
)
WHERE NOT EXISTS (
  SELECT 1 FROM job_id_mapping WHERE old_job_id = j.id
);

-- Phase 5: Update job_parts_requests table
-- First, add new column
ALTER TABLE job_parts_requests 
  ADD COLUMN IF NOT EXISTS booking_id UUID;

-- Update with mapped UUIDs
UPDATE job_parts_requests jpr
SET booking_id = jim.new_booking_id
FROM job_id_mapping jim
WHERE jpr.job_id = jim.old_job_id;

-- Phase 6: Update time_entries table  
-- First, add new column
ALTER TABLE time_entries
  ADD COLUMN IF NOT EXISTS booking_id UUID;

-- Update with mapped UUIDs
UPDATE time_entries te
SET booking_id = jim.new_booking_id
FROM job_id_mapping jim
WHERE te.job_id = jim.old_job_id;

-- Phase 7: Add foreign key constraints for new columns
ALTER TABLE job_parts_requests
  ADD CONSTRAINT fk_job_parts_requests_booking
  FOREIGN KEY (booking_id) 
  REFERENCES user_bookings(id) 
  ON DELETE CASCADE;

ALTER TABLE time_entries
  ADD CONSTRAINT fk_time_entries_booking
  FOREIGN KEY (booking_id)
  REFERENCES user_bookings(id)
  ON DELETE CASCADE;

-- Phase 8: Once verified, drop old columns and table
-- (Commented out for safety - uncomment after verification)
-- ALTER TABLE job_parts_requests DROP COLUMN job_id;
-- ALTER TABLE time_entries DROP COLUMN job_id;
-- DROP TABLE jobs;
-- DROP TABLE job_id_mapping;