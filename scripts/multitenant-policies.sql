-- New RLS policies for multitenant architecture

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

-- New policies for tenants table
CREATE POLICY "Users can view tenants they belong to" ON tenants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenants.id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Tenant owners and admins can update tenants" ON tenants
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = tenants.id
            AND tu.user_id = auth.uid()
            AND tu.role IN ('owner', 'admin')
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Anyone can create tenants" ON tenants
    FOR INSERT WITH CHECK (true);

-- Updated policies for existing tables using tenant_users

-- Patients table policies
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

-- Appointments table policies
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

-- Medical records table policies
CREATE POLICY "Users can view medical records in their tenants" ON medical_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = medical_records.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Users can manage medical records in their tenants" ON medical_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = medical_records.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

-- Documents table policies
CREATE POLICY "Users can view documents in their tenants" ON documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = documents.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

CREATE POLICY "Users can manage documents in their tenants" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.tenant_id = documents.tenant_id
            AND tu.user_id = auth.uid()
            AND tu.status = 'active'
        )
    );

-- Add policies for other tables as needed (subscriptions, financial_transactions, etc.)
-- Following the same pattern...

-- Subscriptions table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
        EXECUTE 'CREATE POLICY "Users can view subscriptions in their tenants" ON subscriptions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = subscriptions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage subscriptions in their tenants" ON subscriptions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = subscriptions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;

-- Financial transactions table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'financial_transactions') THEN
        EXECUTE 'CREATE POLICY "Users can view financial transactions in their tenants" ON financial_transactions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = financial_transactions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage financial transactions in their tenants" ON financial_transactions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = financial_transactions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;

-- Notifications table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        EXECUTE 'CREATE POLICY "Users can view notifications in their tenants" ON notifications
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = notifications.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage notifications in their tenants" ON notifications
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = notifications.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;

-- Odontogram table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'odontogram') THEN
        EXECUTE 'CREATE POLICY "Users can view odontogram in their tenants" ON odontogram
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = odontogram.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage odontogram in their tenants" ON odontogram
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = odontogram.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;
