-- Fix RLS policies to avoid infinite recursion

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their tenant relationships" ON tenant_users;
DROP POLICY IF EXISTS "Tenant owners and admins can view all tenant users" ON tenant_users;
DROP POLICY IF EXISTS "Tenant owners and admins can manage tenant users" ON tenant_users;
DROP POLICY IF EXISTS "Users can view patients in their tenants" ON patients;
DROP POLICY IF EXISTS "Users can manage patients in their tenants" ON patients;
DROP POLICY IF EXISTS "Users can view appointments in their tenants" ON appointments;
DROP POLICY IF EXISTS "Users can manage appointments in their tenants" ON appointments;

-- Create simple, non-recursive policies for tenant_users
CREATE POLICY "tenant_users_select_policy" ON tenant_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "tenant_users_insert_policy" ON tenant_users
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "tenant_users_update_policy" ON tenant_users
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "tenant_users_delete_policy" ON tenant_users
    FOR DELETE USING (auth.uid() = user_id);

-- Create simple policies for tenants table
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON tenants;
CREATE POLICY "tenants_select_policy" ON tenants
    FOR SELECT USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "tenants_insert_policy" ON tenants
    FOR INSERT WITH CHECK (true); -- Allow creation, ownership will be handled by tenant_users

CREATE POLICY "tenants_update_policy" ON tenants
    FOR UPDATE USING (
        id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
        )
    );

-- Create simple policies for other tables
CREATE POLICY "patients_policy" ON patients
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "appointments_policy" ON appointments
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "medical_records_policy" ON medical_records
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "documents_policy" ON documents
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "financial_transactions_policy" ON financial_transactions
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "notifications_policy" ON notifications
    FOR ALL USING (
        tenant_id IN (
            SELECT tenant_id FROM tenant_users 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Add policies for other tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'odontograms') THEN
        EXECUTE 'DROP POLICY IF EXISTS "odontograms_policy" ON odontograms';
        EXECUTE 'CREATE POLICY "odontograms_policy" ON odontograms FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND status = ''active''))';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "prescriptions_policy" ON prescriptions';
        EXECUTE 'CREATE POLICY "prescriptions_policy" ON prescriptions FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND status = ''active''))';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'treatment_plans') THEN
        EXECUTE 'DROP POLICY IF EXISTS "treatment_plans_policy" ON treatment_plans';
        EXECUTE 'CREATE POLICY "treatment_plans_policy" ON treatment_plans FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND status = ''active''))';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        EXECUTE 'DROP POLICY IF EXISTS "subscriptions_policy" ON subscriptions';
        EXECUTE 'CREATE POLICY "subscriptions_policy" ON subscriptions FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND status = ''active''))';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff_profiles') THEN
        EXECUTE 'DROP POLICY IF EXISTS "staff_profiles_policy" ON staff_profiles';
        EXECUTE 'CREATE POLICY "staff_profiles_policy" ON staff_profiles FOR ALL USING (tenant_user_id IN (SELECT id FROM tenant_users WHERE user_id = auth.uid() AND status = ''active''))';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'invitations') THEN
        EXECUTE 'DROP POLICY IF EXISTS "invitations_policy" ON invitations';
        EXECUTE 'CREATE POLICY "invitations_policy" ON invitations FOR ALL USING (tenant_id IN (SELECT tenant_id FROM tenant_users WHERE user_id = auth.uid() AND role IN (''owner'', ''admin'') AND status = ''active''))';
    END IF;
END $$;

-- Create indexes to improve performance of RLS policies
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id_status ON tenant_users(user_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id_status ON tenant_users(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_tenant_status ON tenant_users(user_id, tenant_id, status);
