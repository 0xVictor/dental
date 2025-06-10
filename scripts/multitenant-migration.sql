-- Migration script to convert from single-tenant to multi-tenant architecture
-- This script safely removes dependencies and updates the schema

-- Step 1: Drop all existing RLS policies that depend on user_id
DROP POLICY IF EXISTS "Users can view their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can update their own tenant" ON tenants;
DROP POLICY IF EXISTS "Users can insert their own tenant" ON tenants;

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

-- Drop policies on financial_transactions table
DROP POLICY IF EXISTS "Users can view financial transactions from their tenant" ON financial_transactions;
DROP POLICY IF EXISTS "Users can insert financial transactions to their tenant" ON financial_transactions;
DROP POLICY IF EXISTS "Users can update financial transactions from their tenant" ON financial_transactions;

-- Drop policies on notifications table
DROP POLICY IF EXISTS "Users can view notifications from their tenant" ON notifications;
DROP POLICY IF EXISTS "Users can update notifications from their tenant" ON notifications;

-- Drop policies on odontograms table (if exists)
DROP POLICY IF EXISTS "Users can view odontograms from their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can insert odontograms to their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can update odontograms from their tenant" ON odontograms;
DROP POLICY IF EXISTS "Users can delete odontograms from their tenant" ON odontograms;

-- Drop policies on odontogram table (if exists)
DROP POLICY IF EXISTS "Tenants can access their own odontogram data" ON odontogram;

-- Drop policies on prescriptions table (if exists)
DROP POLICY IF EXISTS "Users can view prescriptions from their tenant" ON prescriptions;
DROP POLICY IF EXISTS "Users can insert prescriptions to their tenant" ON prescriptions;
DROP POLICY IF EXISTS "Users can update prescriptions from their tenant" ON prescriptions;

-- Drop policies on treatment_plans table (if exists)
DROP POLICY IF EXISTS "Users can view treatment plans from their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can insert treatment plans to their tenant" ON treatment_plans;
DROP POLICY IF EXISTS "Users can update treatment plans from their tenant" ON treatment_plans;

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

-- Create staff table for additional staff information
CREATE TABLE IF NOT EXISTS staff (
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

-- Step 4: Now safely remove the user_id column from tenants
ALTER TABLE tenants DROP COLUMN IF EXISTS user_id;

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tenant_users_tenant_id ON tenant_users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_user_id ON tenant_users(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_users_role ON tenant_users(role);
CREATE INDEX IF NOT EXISTS idx_staff_tenant_user_id ON staff(tenant_user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);

-- Step 6: Enable RLS on new tables
ALTER TABLE tenant_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
