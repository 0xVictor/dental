-- Restore policies for all existing tables using the new multitenant structure

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

-- Add policies for other tables conditionally
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

-- Prescriptions table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prescriptions') THEN
        EXECUTE 'CREATE POLICY "Users can view prescriptions in their tenants" ON prescriptions
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = prescriptions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage prescriptions in their tenants" ON prescriptions
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = prescriptions.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;

-- Treatment plans table policies (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'treatment_plans') THEN
        EXECUTE 'CREATE POLICY "Users can view treatment plans in their tenants" ON treatment_plans
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = treatment_plans.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
        
        EXECUTE 'CREATE POLICY "Users can manage treatment plans in their tenants" ON treatment_plans
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM tenant_users tu
                    WHERE tu.tenant_id = treatment_plans.tenant_id
                    AND tu.user_id = auth.uid()
                    AND tu.status = ''active''
                )
            )';
    END IF;
END $$;
