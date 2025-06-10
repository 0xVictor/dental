-- Debug script to check patients table structure and data
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if patients table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'patients' 
ORDER BY ordinal_position;

-- 2. Check RLS policies on patients table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'patients';

-- 3. Check if there are any patients in the table
SELECT 
    COUNT(*) as total_patients,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_patients,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as patients_last_24h
FROM patients;

-- 4. Check recent patients (last 10)
SELECT 
    id,
    name,
    email,
    phone,
    status,
    tenant_id,
    created_at
FROM patients 
ORDER BY created_at DESC 
LIMIT 10;

-- 5. Check tenants table to ensure it exists
SELECT 
    id,
    clinic_name,
    plan,
    user_id,
    created_at
FROM tenants 
ORDER BY created_at DESC 
LIMIT 5;

-- 6. Check if appointments table exists
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'appointments' 
ORDER BY ordinal_position;

-- 7. Check recent appointments
SELECT 
    COUNT(*) as total_appointments,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_appointments,
    COUNT(CASE WHEN created_at > NOW() - INTERVAL '1 day' THEN 1 END) as appointments_last_24h
FROM appointments;

-- 8. Check for any foreign key constraints
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'patients' OR tc.table_name = 'appointments');
