-- First, let's clear any existing sample data
DELETE FROM notifications WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM financial_transactions WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM staff WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM subscriptions WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM medical_records WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM appointments WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM patients WHERE tenant_id IN (
    SELECT id FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center')
);
DELETE FROM tenants WHERE name IN ('Smile Dental Clinic', 'Bright Teeth Center');

-- Note: Sample data will be created when users register and create tenants through the application
-- This ensures proper foreign key relationships with actual auth.users records

-- Create a function to generate sample data for a tenant (to be called after tenant creation)
CREATE OR REPLACE FUNCTION generate_sample_data_for_tenant(tenant_uuid UUID)
RETURNS void AS $$
DECLARE
    patient1_id UUID;
    patient2_id UUID;
    patient3_id UUID;
    patient4_id UUID;
    patient5_id UUID;
    appointment1_id UUID;
    appointment2_id UUID;
    appointment3_id UUID;
BEGIN
    -- Insert sample patients
    INSERT INTO patients (tenant_id, name, email, phone, date_of_birth, address, status) VALUES
        (tenant_uuid, 'John Smith', 'john.smith@email.com', '+1 (555) 111-2222', '1985-03-15', '789 Elm St, New York, NY 10002', 'active')
        RETURNING id INTO patient1_id;
    
    INSERT INTO patients (tenant_id, name, email, phone, date_of_birth, address, status) VALUES
        (tenant_uuid, 'Sarah Johnson', 'sarah.johnson@email.com', '+1 (555) 333-4444', '1990-07-22', '321 Pine St, New York, NY 10003', 'active')
        RETURNING id INTO patient2_id;
    
    INSERT INTO patients (tenant_id, name, email, phone, date_of_birth, address, status) VALUES
        (tenant_uuid, 'Michael Brown', 'michael.brown@email.com', '+1 (555) 555-6666', '1978-11-08', '654 Maple Ave, New York, NY 10004', 'active')
        RETURNING id INTO patient3_id;
    
    INSERT INTO patients (tenant_id, name, email, phone, date_of_birth, address, status) VALUES
        (tenant_uuid, 'Emily Davis', 'emily.davis@email.com', '+1 (555) 777-8888', '1995-01-30', '987 Cedar Blvd, New York, NY 10005', 'active')
        RETURNING id INTO patient4_id;
    
    INSERT INTO patients (tenant_id, name, email, phone, date_of_birth, address, status) VALUES
        (tenant_uuid, 'David Wilson', 'david.wilson@email.com', '+1 (555) 999-0000', '1982-09-12', '147 Birch Ln, New York, NY 10006', 'active')
        RETURNING id INTO patient5_id;

    -- Insert sample appointments
    INSERT INTO appointments (tenant_id, patient_id, appointment_date, appointment_time, duration, type, status, room) VALUES
        (tenant_uuid, patient1_id, CURRENT_DATE, '09:00:00', 30, 'Check-up', 'scheduled', 'Room 1')
        RETURNING id INTO appointment1_id;
    
    INSERT INTO appointments (tenant_id, patient_id, appointment_date, appointment_time, duration, type, status, room) VALUES
        (tenant_uuid, patient2_id, CURRENT_DATE, '10:00:00', 45, 'Cleaning', 'confirmed', 'Room 2')
        RETURNING id INTO appointment2_id;
    
    INSERT INTO appointments (tenant_id, patient_id, appointment_date, appointment_time, duration, type, status, room) VALUES
        (tenant_uuid, patient3_id, CURRENT_DATE + INTERVAL '1 day', '11:30:00', 60, 'Root Canal', 'scheduled', 'Room 3')
        RETURNING id INTO appointment3_id;
    
    INSERT INTO appointments (tenant_id, patient_id, appointment_date, appointment_time, duration, type, status, room) VALUES
        (tenant_uuid, patient4_id, CURRENT_DATE + INTERVAL '2 days', '14:00:00', 30, 'Consultation', 'scheduled', 'Room 1');
    
    INSERT INTO appointments (tenant_id, patient_id, appointment_date, appointment_time, duration, type, status, room) VALUES
        (tenant_uuid, patient5_id, CURRENT_DATE + INTERVAL '3 days', '15:30:00', 45, 'Filling', 'scheduled', 'Room 2');

    -- Insert sample medical records
    INSERT INTO medical_records (tenant_id, patient_id, record_type, title, description, diagnosis, treatment) VALUES
        (tenant_uuid, patient1_id, 'examination', 'Annual Check-up 2023', 'Routine dental examination', 'Good oral health, minor plaque buildup', 'Professional cleaning recommended'),
        (tenant_uuid, patient2_id, 'treatment', 'Cavity Treatment', 'Treatment for cavity in upper molar', 'Dental caries in tooth #14', 'Composite filling placed'),
        (tenant_uuid, patient3_id, 'consultation', 'Root Canal Consultation', 'Consultation for root canal treatment', 'Infected root canal in tooth #19', 'Root canal therapy recommended');

    -- Insert sample subscription
    INSERT INTO subscriptions (tenant_id, plan, status, current_period_start, current_period_end) VALUES
        (tenant_uuid, 'free', 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days');

    -- Insert sample financial transactions
    INSERT INTO financial_transactions (tenant_id, patient_id, transaction_type, amount, description, payment_method, status) VALUES
        (tenant_uuid, patient1_id, 'payment', 150.00, 'Annual check-up and cleaning', 'credit_card', 'completed'),
        (tenant_uuid, patient2_id, 'payment', 275.00, 'Cavity filling treatment', 'insurance', 'completed'),
        (tenant_uuid, patient3_id, 'payment', 850.00, 'Root canal therapy', 'cash', 'pending');

    -- Insert sample staff
    INSERT INTO staff (tenant_id, name, email, phone, role, specialization, license_number, status) VALUES
        (tenant_uuid, 'Dr. Jennifer Martinez', 'dr.martinez@clinic.com', '+1 (555) 123-4567', 'dentist', 'General Dentistry', 'DDS-12345', 'active'),
        (tenant_uuid, 'Lisa Thompson', 'lisa.thompson@clinic.com', '+1 (555) 123-4568', 'hygienist', 'Dental Hygiene', 'RDH-67890', 'active'),
        (tenant_uuid, 'Mark Rodriguez', 'mark.rodriguez@clinic.com', '+1 (555) 123-4569', 'assistant', 'Dental Assistance', 'DA-11111', 'active'),
        (tenant_uuid, 'Amanda Chen', 'amanda.chen@clinic.com', '+1 (555) 123-4570', 'receptionist', 'Front Office', NULL, 'active');

    -- Insert welcome notification
    INSERT INTO notifications (tenant_id, title, message, type) VALUES
        (tenant_uuid, 'Welcome to DentalFlow', 'Your dental clinic management system is ready to use! We''ve added some sample data to help you get started.', 'success');

END;
$$ LANGUAGE plpgsql;

-- Note: This function can be called after a tenant is created:
-- SELECT generate_sample_data_for_tenant('your-tenant-uuid-here');
