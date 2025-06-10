-- Create RPC functions to avoid RLS recursion issues

-- Function to get user's tenants without RLS recursion
CREATE OR REPLACE FUNCTION get_user_tenants(user_id UUID)
RETURNS TABLE (
    tenant_id UUID,
    role TEXT,
    permissions JSONB,
    joined_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tu.tenant_id,
        tu.role,
        tu.permissions,
        tu.created_at as joined_at
    FROM tenant_users tu
    WHERE tu.user_id = get_user_tenants.user_id 
    AND tu.status = 'active'
    ORDER BY tu.created_at ASC;
END;
$$;

-- Function to get user's tenants with tenant details
CREATE OR REPLACE FUNCTION get_user_tenants_with_details(user_id UUID)
RETURNS TABLE (
    tenant_id UUID,
    role TEXT,
    permissions JSONB,
    tenant_name TEXT,
    tenant_address TEXT,
    tenant_phone TEXT,
    tenant_email TEXT,
    tenant_plan TEXT,
    tenant_created_at TIMESTAMPTZ
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tu.tenant_id,
        tu.role,
        tu.permissions,
        t.name as tenant_name,
        t.address as tenant_address,
        t.phone as tenant_phone,
        t.email as tenant_email,
        t.plan as tenant_plan,
        t.created_at as tenant_created_at
    FROM tenant_users tu
    JOIN tenants t ON t.id = tu.tenant_id
    WHERE tu.user_id = get_user_tenants_with_details.user_id 
    AND tu.status = 'active'
    ORDER BY tu.created_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_tenants(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_tenants_with_details(UUID) TO authenticated;
