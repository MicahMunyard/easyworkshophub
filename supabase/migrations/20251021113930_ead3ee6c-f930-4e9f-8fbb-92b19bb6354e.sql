-- Make job_id nullable in job_parts_requests since we're now using booking_id
ALTER TABLE job_parts_requests 
ALTER COLUMN job_id DROP NOT NULL;