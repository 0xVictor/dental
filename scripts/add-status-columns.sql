-- Add status column to medical_records table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'medical_records' AND column_name = 'status') THEN
        ALTER TABLE medical_records ADD COLUMN status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'completed', 'cancelled'));
    END IF;
END $$;

-- Update existing medical_records to have a status
UPDATE medical_records SET status = 'active' WHERE status IS NULL;

-- Add indexes for better performance on dashboard queries
CREATE INDEX IF NOT EXISTS idx_patients_tenant_status ON patients(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_date_status ON appointments(tenant_id, appointment_date, status);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_tenant_date_type_status ON financial_transactions(tenant_id, transaction_date, transaction_type, status);
CREATE INDEX IF NOT EXISTS idx_medical_records_tenant_type_status ON medical_records(tenant_id, record_type, status);
CREATE INDEX IF NOT EXISTS idx_documents_tenant_size ON documents(tenant_id, file_size);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_status ON staff(tenant_id, status);

-- Add created_at index for patient growth calculations
CREATE INDEX IF NOT EXISTS idx_patients_tenant_created_at ON patients(tenant_id, created_at);
