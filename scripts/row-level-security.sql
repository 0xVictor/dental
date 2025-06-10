-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants table
CREATE POLICY "Users can view their own tenant" ON tenants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tenant" ON tenants
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tenant" ON tenants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for patients table
CREATE POLICY "Users can view patients from their tenant" ON patients
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert patients to their tenant" ON patients
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update patients from their tenant" ON patients
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete patients from their tenant" ON patients
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for appointments table
CREATE POLICY "Users can view appointments from their tenant" ON appointments
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert appointments to their tenant" ON appointments
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update appointments from their tenant" ON appointments
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete appointments from their tenant" ON appointments
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for medical_records table
CREATE POLICY "Users can view medical records from their tenant" ON medical_records
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert medical records to their tenant" ON medical_records
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update medical records from their tenant" ON medical_records
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete medical records from their tenant" ON medical_records
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for documents table
CREATE POLICY "Users can view documents from their tenant" ON documents
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert documents to their tenant" ON documents
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update documents from their tenant" ON documents
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete documents from their tenant" ON documents
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for subscriptions table
CREATE POLICY "Users can view subscriptions from their tenant" ON subscriptions
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert subscriptions to their tenant" ON subscriptions
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update subscriptions from their tenant" ON subscriptions
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for financial_transactions table
CREATE POLICY "Users can view financial transactions from their tenant" ON financial_transactions
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert financial transactions to their tenant" ON financial_transactions
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update financial transactions from their tenant" ON financial_transactions
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

-- Create RLS policies for staff table
CREATE POLICY "Users can view staff from their tenant" ON staff
    FOR SELECT USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert staff to their tenant" ON staff
    FOR INSERT WITH CHECK (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update staff from their tenant" ON staff
    FOR UPDATE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete staff from their tenant" ON staff
    FOR DELETE USING (
        tenant_id IN (
            SELECT id FROM tenants WHERE user_id = auth.uid()
        )
    );
