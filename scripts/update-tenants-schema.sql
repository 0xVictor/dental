-- Add new columns to tenants table for rooms and appointment types
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS rooms JSONB DEFAULT '["Room 1", "Room 2", "Room 3", "Room 4", "Surgery 1", "Surgery 2"]',
ADD COLUMN IF NOT EXISTS appointment_types JSONB DEFAULT '["Check-up", "Cleaning", "Consultation", "Root Canal", "Filling", "Extraction", "Crown", "Bridge", "Implant", "Orthodontics", "Emergency", "Follow-up"]';

-- Update existing tenants with default values if they don't have them
UPDATE tenants 
SET 
  rooms = '["Room 1", "Room 2", "Room 3", "Room 4", "Surgery 1", "Surgery 2"]'
WHERE rooms IS NULL;

UPDATE tenants 
SET 
  appointment_types = '["Check-up", "Cleaning", "Consultation", "Root Canal", "Filling", "Extraction", "Crown", "Bridge", "Implant", "Orthodontics", "Emergency", "Follow-up"]'
WHERE appointment_types IS NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_tenants_rooms ON tenants USING GIN (rooms);
CREATE INDEX IF NOT EXISTS idx_tenants_appointment_types ON tenants USING GIN (appointment_types);
