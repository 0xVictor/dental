-- Create odontogram table for storing dental chart data
CREATE TABLE IF NOT EXISTS odontogram (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    teeth_data JSONB NOT NULL DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_odontogram_tenant_id ON odontogram(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odontogram_patient_id ON odontogram(patient_id);

-- Add RLS policies
ALTER TABLE odontogram ENABLE ROW LEVEL SECURITY;

-- Policy for tenants to access their own odontogram data
CREATE POLICY "Tenants can access their own odontogram data" ON odontogram
    FOR ALL USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Add unique constraint to ensure one odontogram per patient
CREATE UNIQUE INDEX IF NOT EXISTS idx_odontogram_unique_patient 
ON odontogram(tenant_id, patient_id);
