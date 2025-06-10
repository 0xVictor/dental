-- Complete migration script to convert from single-tenant to multi-tenant architecture
-- This script removes ALL dependencies and updates the schema safely

-- Step 1: Drop ALL existing RLS policies that depend on user_id from tenants table
-- Using explicit policy names instead of dynamic queries

-- Drop policies on tenants table
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can insert their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can delete their own tenant" ON tenants;

-- Drop policies on patients table
DROP POLICY IF EXISTS "Users can view patients from their tenant" ON patients;
DROP POLICY IF EXISTS "Users can insert patients to their tenant" ON patients;
DROP POLICY IF EXISTS "Users can update patients from their tenant" ON patients;
DROP POLICY IF EXISTS "Users can delete patients from their tenant" ON patients;

-- Drop policies on appointments table
DROP POLICY IF EXISTS "Users can view appointments from their tenant" ON appointments;
DROP POLICY IF EXISTS "Users can insert appointments to their tenant" ON appointments;
DROP POLICY IF EXISTS "Users can update appointments from their tenant" ON appointments;
DROP POLICY IF EXISTS "Users can delete appointments from their tenant" ON appointments;

-- Drop policies on medical_records table
DROP POLICY IF EXISTS "Users can view medical records from their tenant" ON medical_records;
DROP POLICY IF EXISTS "Users can insert medical records to their tenant" ON medical_records;
DROP POLICY IF EXISTS "Users can update medical records from their tenant" ON medical_records;
DROP POLICY IF EXISTS "Users can delete medical records from their tenant" ON medical_records;

-- Drop policies on documents table
DROP POLICY IF EXISTS "Users can view documents from their tenant" ON documents;
DROP POLICY IF EXISTS "Users can insert documents to their tenant" ON documents;
DROP POLICY IF EXISTS "Users can update documents from their tenant" ON documents;
DROP POLICY IF EXISTS "Users can delete documents from their tenant" ON documents;

-- Drop policies on subscriptions table
DROP POLICY IF EXISTS "Users can view subscriptions from their tenant" ON subscriptions;
DROP POLICY IF EXISTS "Users can insert subscriptions to their tenant" ON subscriptions;
DROP POLICY IF EXISTS "Users can update subscriptions from their tenant" ON subscriptions;
DROP POLICY IF EXISTS "Users can delete subscriptions from their tenant" ON subscriptions;

-- Drop policies on financial_transactions table
DROP POLICY IF EXISTS "Users can view financial transactions from their tenant" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert financial transactions to their tenant" ON financial_transactions;
DROP POLICY IF EXISTS "Users can update financial transactions from their tenant" ON financial_transactions;
DROP POLICY IF EXISTS "Users can delete financial transactions from their tenant" ON financial_transactions;

-- Drop policies on notifications table
DROP POLICY IF EXISTS "Users can view notifications from their tenant" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications from their tenant" ON notifications;
DROP POLICY IF EXISTS "Users can insert notifications to their tenant" ON notifications;
DROP POLICY IF EXISTS "Users can delete notifications from their tenant" ON notifications;

-- Drop policies on staff table (these were missing in the previous script)
DROP POLICY IF EXISTS "Users can view staff from their tenant" ON staff;
DROP POLICY IF EXISTS "Users can insert staff to their tenant" ON staff;
DROP POLICY IF EXISTS "Users can update staff from their tenant" ON staff;
DROP POLICY IF EXISTS "Users can delete staff from their tenant" ON staff;

-- Drop policies on odontograms table (if exists)
DROP POLICY IF EXISTS "Users can view odontograms from their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can insert odontograms to their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can update odontograms from their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can delete odontograms from their tenant" ON odontograms;

-- Drop policies on odontogram table (if exists)
DROP POLICY IF EXISTS "Tenants can access their own odontogram data" ON odontogram;
DROP POLICY IF EXISTS "Users can view odontogram from their tenant" ON odontogram;
DROP POLICY IF EXISTS "Users can insert odontogram to their tenant" ON odontogram;
DROP POLICY IF EXISTS "Users can update odontogram from their tenant" ON odontogram;
DROP POLICY IF EXISTS "Users can delete odontogram from their tenant" ON odontogram;

-- Drop policies on prescriptions table (if exists)
DROP POLICY IF EXISTS "Users can view prescriptions from their tenant" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert prescriptions to their tenant" ON prescriptions;
DROP POLICY IF EXISTS "Users can update prescriptions from their tenant" ON prescriptions;
DROP POLICY IF EXISTS "Users can delete prescriptions from their tenant" ON prescriptions;

-- Drop policies on treatment_plans table (if exists)
DROP POLICY IF EXISTS "Users can view treatment plans from their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can insert treatment plans to their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can update treatment plans from their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can delete treatment plans from their tenant" ON treatment_plans;

-- Additional policies that might exist with different naming patterns
DROP POLICY IF EXISTS "tenant_isolation_policy" ON patients;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON appointments;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON medical_records;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON documents;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON staff;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON subscriptions;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON financial_transactions;
DROP POLICY IF EXISTS "tenant_isolation_policy" ON notifications;

-- Step 2: Create new multitenant tables
-- Create tenant_users junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS tenant_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'dentist', 'hygienist', 'assistant', 'receptionist')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id)
);

-- Create new staff table for additional staff information
CREATE TABLE IF NOT EXISTS staff_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_user_id UUID REFERENCES tenant_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    specialization VARCHAR(255),
    license_number VARCHAR(100),
    bio TEXT,
    avatar_url TEXT,
    working_hours JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table for inviting users to tenants
CREATE TABLE IF NOT EXISTS invitations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'dentist', 'hygienist', 'assistant', 'receptionist')),
    invited_by UUID REFERENCES auth.users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Step 3: Migrate existing data from tenants to tenant_users
-- Only migrate if user_id column still exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'user_id'
    ) THEN
        INSERT INTO tenant_users (tenant_id, user_id, role, status, joined_at, created_at, updated_at)
        SELECT 
            id as tenant_id,
            user_id,
            'owner' as role,
            'active' as status,
            created_at as joined_at,
            created_at,
            updated_at
        FROM tenants 
        WHERE user_id IS NOT NULL
        ON CONFLICT (tenant_id, user_id) DO NOTHING;
        
        RAISE NOTICE 'Migrated % existing tenant owners to tenant_users', 
            (SELECT COUNT(*) FROM tenant_users WHERE role = 'owner');
    END IF;
END $$;

-- Step 4: Migrate existing staff data if the old staff table exists
-- This version checks for column existence and adapts the query accordingly
DO $$
DECLARE
    staff_count INTEGER := 0;
    column_exists BOOLEAN;
    query_text TEXT;
    columns_list TEXT := 'tenant_user_id, name, email';
    values_list TEXT := 'tu.id as tenant_user_id, s.name, s.email';
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'staff') THEN
        -- First, we need to create tenant_users entries for staff members if they don't exist
        INSERT INTO tenant_users (tenant_id, user_id, role, status, joined_at, created_at, updated_at)
        SELECT DISTINCT
            s.tenant_id,
            s.user_id,
            COALESCE(s.role, 'assistant') as role,
            'active' as status,
            s.created_at as joined_at,
            s.created_at,
            s.updated_at
        FROM staff s
        WHERE s.user_id IS NOT NULL
        ON CONFLICT (tenant_id, user_id) DO NOTHING;
        
        -- Check for each possible column and build the query dynamically
        -- Phone column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'phone'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', phone';
            values_list := values_list || ', s.phone';
        ELSE
            columns_list := columns_list || ', phone';
            values_list := values_list || ', NULL';
        END IF;
        
        -- Specialization column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'specialization'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', specialization';
            values_list := values_list || ', s.specialization';
        ELSE
            columns_list := columns_list || ', specialization';
            values_list := values_list || ', NULL';
        END IF;
        
        -- License number column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'license_number'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', license_number';
            values_list := values_list || ', s.license_number';
        ELSE
            columns_list := columns_list || ', license_number';
            values_list := values_list || ', NULL';
        END IF;
        
        -- Bio column (which was causing the error)
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'bio'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', bio';
            values_list := values_list || ', s.bio';
        ELSE
            columns_list := columns_list || ', bio';
            values_list := values_list || ', NULL';
        END IF;
        
        -- Avatar URL column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'avatar_url'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', avatar_url';
            values_list := values_list || ', s.avatar_url';
        ELSE
            columns_list := columns_list || ', avatar_url';
            values_list := values_list || ', NULL';
        END IF;
        
        -- Working hours column
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'staff' AND column_name = 'working_hours'
        ) INTO column_exists;
        
        IF column_exists THEN
            columns_list := columns_list || ', working_hours';
            values_list := values_list || ', s.working_hours';
        ELSE
            columns_list := columns_list || ', working_hours';
            values_list := values_list || ', ''{}''::jsonb';
        END IF;
        
        -- Created at and updated at columns
        columns_list := columns_list || ', created_at, updated_at';
        values_list := values_list || ', s.created_at, s.updated_at';
        
        -- Build and execute the dynamic query
        query_text := 'INSERT INTO staff_profiles (' || columns_list || ') 
                      SELECT ' || values_list || ' 
                      FROM staff s
                      JOIN tenant_users tu ON tu.tenant_id = s.tenant_id AND tu.user_id = s.user_id';
        
        EXECUTE query_text;
        
        GET DIAGNOSTICS staff_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % staff profiles with query: %', staff_count, query_text;
        
        -- Drop the old staff table
        DROP TABLE staff CASCADE;
        RAISE NOTICE 'Dropped old staff table';
    END IF;
END $$;

-- Step 5: Now safely remove the user_id column from tenants
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tenants' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE tenants DROP COLUMN user_id;
        RAISE NOTICE 'Removed user_id column from tenants table';
    END IF;
END $$;

-- Step 6: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_tenant_users_status ON tenant_users(status);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_tenant_user_id ON staff_profiles(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_tenant_id ON invitations(tenant_id);

-- Step 7: Enable RLS on new tables
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Step 8: Create basic policies for new tables
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

-- Policies for staff_profiles table
CREATE POLICY "Users can view staff in their tenants" ON staff_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            WHERE tu.id = staff_profiles.tenant_user_id
            AND EXISTS (
                SELECT 1 FROM tenant_users tu2
                WHERE tu2.tenant_id = tu.tenant_id
                AND tu2.user_id = auth.uid()
                AND tu2.status = 'active'
            )
        )
    );

CREATE POLICY "Tenant owners and admins can manage staff" ON staff_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM tenant_users tu
            JOIN tenant_users tu2 ON tu.tenant_id = tu2.tenant_id
            WHERE tu.id = staff_profiles.tenant_user_id
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

-- Final success message
DO $$
BEGIN
    RAISE NOTICE 'Multitenant migration completed successfully!';
    RAISE NOTICE 'New tables created: tenant_users, staff_profiles, invitations';
    RAISE NOTICE 'Data migrated and user_id column removed from tenants';
    RAISE NOTICE 'Basic RLS policies created for new multitenant structure';
END $$;
