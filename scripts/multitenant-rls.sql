-- Row Level Security for multitenant tables

-- Enable RLS on new tables
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Policies for tenant_users table
CREATE POLICY "Users can view their own tenant relationships" ON tenant_users
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Tenant owners and admins can view all tenant users" ON tenant_users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.role IN ('owner', 'admin')
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Tenant owners and admins can manage tenant users" ON tenant_users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenant_users.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.role IN ('owner', 'admin')
            AND tu.status = 'active'
        )
    );

-- Policies for staff table
CREATE POLICY "Users can view staff in their tenants" ON staff
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.id = staff.tenant_user_id
            AND EXISTS (
                SELECT 1 FROM tenant_users tu2
                WHERE tu2.tenant_id = tu.tenant_id
                AND tu2.user_id = auth.uid()
                AND tu2.status = 'active'
            )
        )
    );

CREATE POLICY "Tenant owners and admins can manage staff" ON staff
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            JOIN tenant_users tu2 ON tu.tenant_id = tu2.tenant_id
            WHERE tu.id = staff.tenant_user_id
            AND tu2.user_id = auth.uid()
            AND tu2.role IN ('owner', 'admin')
            AND tu2.status = 'active'
        )
    );

-- Policies for invitations table
CREATE POLICY "Tenant owners and admins can manage invitations" ON invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = invitations.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.role IN ('owner', 'admin')
            AND tu.status = 'active'
        )
    );

-- Update existing table policies to use tenant_users
DROP POLICY IF EXISTS "Users can only see their own tenant data" ON patients;
CREATE POLICY "Users can view patients in their tenants" ON patients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = patients.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Users can manage patients in their tenants" ON patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = patients.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

-- Similar updates for other tables (appointments, medical_records, etc.)
DROP POLICY IF EXISTS "Users can only see their own tenant data" ON appointments;
CREATE POLICY "Users can view appointments in their tenants" ON appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = appointments.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Users can manage appointments in their tenants" ON appointments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = appointments.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );
