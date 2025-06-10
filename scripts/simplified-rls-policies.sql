-- Drop all existing policies first
DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on all tables
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontograms ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;

-- Simple policies for tenant_users (base table)
CREATE POLICY "Users can view their own tenant relationships" ON tenant_users
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tenant relationships" ON tenant_users
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tenant relationships" ON tenant_users
    FOR UPDATE USING (user_id = auth.uid());

-- Simple policies for tenants
CREATE POLICY "Users can view tenants they belong to" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert tenants" ON tenants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update tenants they belong to" ON tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Simple policies for patients
CREATE POLICY "Users can view patients from their tenants" ON patients
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert patients to their tenants" ON patients
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update patients from their tenants" ON patients
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete patients from their tenants" ON patients
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Simple policies for appointments
CREATE POLICY "Users can view appointments from their tenants" ON appointments
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert appointments to their tenants" ON appointments
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update appointments from their tenants" ON appointments
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete appointments from their tenants" ON appointments
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Apply similar pattern to other tables
CREATE POLICY "Users can view medical records from their tenants" ON medical_records
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert medical records to their tenants" ON medical_records
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update medical records from their tenants" ON medical_records
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete medical records from their tenants" ON medical_records
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Documents policies
CREATE POLICY "Users can view documents from their tenants" ON documents
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert documents to their tenants" ON documents
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update documents from their tenants" ON documents
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete documents from their tenants" ON documents
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Financial transactions policies
CREATE POLICY "Users can view financial transactions from their tenants" ON financial_transactions
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert financial transactions to their tenants" ON financial_transactions
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update financial transactions from their tenants" ON financial_transactions
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view subscriptions from their tenants" ON subscriptions
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert subscriptions to their tenants" ON subscriptions
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update subscriptions from their tenants" ON subscriptions
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Notifications policies
CREATE POLICY "Users can view notifications from their tenants" ON notifications
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update notifications from their tenants" ON notifications
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Odontograms policies
CREATE POLICY "Users can view odontograms from their tenants" ON odontograms
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert odontograms to their tenants" ON odontograms
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update odontograms from their tenants" ON odontograms
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can delete odontograms from their tenants" ON odontograms
    FOR DELETE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Staff profiles policies
CREATE POLICY "Users can view staff profiles from their tenants" ON staff_profiles
    FOR SELECT USING (
        tenant_user_id IN (
            SELECT id FROM tenant_users 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can insert staff profiles to their tenants" ON staff_profiles
    FOR INSERT WITH CHECK (
        tenant_user_id IN (
            SELECT id FROM tenant_users 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

CREATE POLICY "Users can update staff profiles from their tenants" ON staff_profiles
    FOR UPDATE USING (
        tenant_user_id IN (
            SELECT id FROM tenant_users 
            WHERE tenant_id IN (
                SELECT tenant_id FROM tenant_users 
                WHERE user_id = auth.uid() AND status = 'active'
            )
        )
    );

-- Invitations policies
CREATE POLICY "Users can view invitations from their tenants" ON invitations
    FOR SELECT USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can insert invitations to their tenants" ON invitations
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Users can update invitations from their tenants" ON invitations
    FOR UPDATE USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Add policies for other tables if they exist
DO $$ 
BEGIN
    -- Prescriptions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
        EXECUTE 'CREATE POLICY "Users can view prescriptions from their tenants" ON prescriptions
            FOR SELECT USING (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can insert prescriptions to their tenants" ON prescriptions
            FOR INSERT WITH CHECK (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can update prescriptions from their tenants" ON prescriptions
            FOR UPDATE USING (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
    END IF;

    -- Treatment plans
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'treatment_plans') THEN
        EXECUTE 'CREATE POLICY "Users can view treatment plans from their tenants" ON treatment_plans
            FOR SELECT USING (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can insert treatment plans to their tenants" ON treatment_plans
            FOR INSERT WITH CHECK (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can update treatment plans from their tenants" ON treatment_plans
            FOR UPDATE USING (
                tenant_id IN (
                    SELECT tenant_id FROM tenant_users 
                    WHERE user_id = auth.uid() AND status = ''active''
                )
            )';
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_tenant ON tenant_users(user_id, tenant_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
