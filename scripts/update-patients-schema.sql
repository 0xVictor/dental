-- Add missing columns to patients table
DO $$ 
BEGIN
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'gender') THEN
        ALTER TABLE patients ADD COLUMN gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other'));
    END IF;

    -- Add insurance column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'patients' AND column_name = 'insurance') THEN
        ALTER TABLE patients ADD COLUMN insurance TEXT;
    END IF;
END $$;

-- Update existing patients to have default gender if null
UPDATE patients SET gender = 'male' WHERE gender IS NULL;

-- Create odontogram table for storing tooth data
CREATE TABLE IF NOT EXISTS odontograms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    tooth_number INTEGER NOT NULL CHECK (tooth_number >= 1 AND tooth_number <= 32),
    status VARCHAR(20) DEFAULT 'healthy' CHECK (status IN ('healthy', 'cavity', 'filled', 'crown', 'missing', 'root_canal', 'implant')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(patient_id, tooth_number)
);

-- Create indexes for odontogram table
CREATE INDEX IF NOT EXISTS idx_odontograms_tenant_id ON odontograms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_odontograms_patient_id ON odontograms(patient_id);

-- Enable RLS on odontograms table
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for odontograms
CREATE POLICY "Users can view odontograms from their tenant" ON odontograms
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert odontograms to their tenant" ON odontograms
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update odontograms from their tenant" ON odontograms
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete odontograms from their tenant" ON odontograms
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create prescriptions table
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT,
    prescribed_by VARCHAR(255),
    prescribed_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for prescriptions table
CREATE INDEX IF NOT EXISTS idx_prescriptions_tenant_id ON prescriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);

-- Enable RLS on prescriptions table
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for prescriptions
CREATE POLICY "Users can view prescriptions from their tenant" ON prescriptions
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert prescriptions to their tenant" ON prescriptions
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update prescriptions from their tenant" ON prescriptions
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create treatment_plans table
CREATE TABLE IF NOT EXISTS treatment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_cost DECIMAL(10,2),
    estimated_duration VARCHAR(100),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for treatment_plans table
CREATE INDEX IF NOT EXISTS idx_treatment_plans_tenant_id ON treatment_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_treatment_plans_patient_id ON treatment_plans(patient_id);

-- Enable RLS on treatment_plans table
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for treatment_plans
CREATE POLICY "Users can view treatment plans from their tenant" ON treatment_plans
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert treatment plans to their tenant" ON treatment_plans
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update treatment plans from their tenant" ON treatment_plans
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );
