import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getTenantDetails(userId: string) {
  try {
    console.log("Getting tenant details for user:", userId)

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Get current tenant ID from cookie
    const currentTenantId = cookies().get("currentTenantId")?.value
    console.log("Current tenant ID from cookie:", currentTenantId)

    let tenantId = currentTenantId

    // If no tenant ID in cookie, get the first tenant the user belongs to
    if (!tenantId) {
      console.log("No tenant ID in cookie, fetching user's tenants...")

      // Use a simple direct query
      const { data: tenantUsers, error: tenantUsersError } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: true })
        .limit(1)

      if (tenantUsersError || !tenantUsers || tenantUsers.length === 0) {
        console.error("No tenants found for user:", tenantUsersError || "No tenants")
        return null
      }

      tenantId = tenantUsers[0].tenant_id
      console.log("Found tenant ID:", tenantId)

      // Set the tenant as current in cookie
      cookies().set("currentTenantId", tenantId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      })
      console.log("Set current tenant ID in cookie:", tenantId)
    }

    // Get tenant details
    console.log("Fetching tenant details for ID:", tenantId)
    const { data: tenantData, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", tenantId)
      .single()

    if (tenantError) {
      console.error("Error getting tenant details:", tenantError)
      return null
    }

    // Get user's role in this tenant
    const { data: tenantUser, error: roleError } = await supabase
      .from("tenant_users")
      .select("role, permissions")
      .eq("tenant_id", tenantId)
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (roleError) {
      console.error("Error getting user role:", roleError)
      // Return tenant without role info rather than failing completely
      return {
        ...tenantData,
        userRole: "member",
        permissions: {},
      }
    }

    const result = {
      ...tenantData,
      userRole: tenantUser?.role || "member",
      permissions: tenantUser?.permissions || {},
    }

    console.log("Successfully retrieved tenant details:", result.name)
    return result
  } catch (error) {
    console.error("Error in getTenantDetails:", error)
    return null
  }
}

export async function getUserTenants(userId: string) {
  try {
    console.log("Getting all tenants for user:", userId)

    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // First get tenant_users data
    const { data: tenantUsers, error: tenantUsersError } = await supabase
      .from("tenant_users")
      .select("tenant_id, role, permissions, created_at")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })

    if (tenantUsersError) {
      console.error("Error getting tenant users:", tenantUsersError)
      return []
    }

    if (!tenantUsers || tenantUsers.length === 0) {
      console.log("No tenant users found")
      return []
    }

    // Get tenant details for each tenant
    const tenantIds = tenantUsers.map((tu) => tu.tenant_id)
    const { data: tenants, error: tenantsError } = await supabase
      .from("tenants")
      .select("id, name, address, phone, email, plan, created_at")
      .in("id", tenantIds)

    if (tenantsError) {
      console.error("Error getting tenants:", tenantsError)
      return []
    }

    // Combine the data
    const result = tenantUsers
      .map((tenantUser) => {
        const tenant = tenants?.find((t) => t.id === tenantUser.tenant_id)
        return {
          tenant_id: tenantUser.tenant_id,
          role: tenantUser.role,
          permissions: tenantUser.permissions,
          created_at: tenantUser.created_at,
          tenants: tenant || null,
        }
      })
      .filter((item) => item.tenants !== null)

    console.log("Found tenants:", result.length)
    return result
  } catch (error) {
    console.error("Error in getUserTenants:", error)
    return []
  }
}

export async function checkUserPermission(userId: string, tenantId: string, permission: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: tenantUser, error } = await supabase
      .from("tenant_users")
      .select("role, permissions")
      .eq("user_id", userId)
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .single()

    if (error || !tenantUser) {
      return false
    }

    // Owner and admin have all permissions
    if (tenantUser.role === "owner" || tenantUser.role === "admin") {
      return true
    }

    // Check specific permissions
    const permissions = tenantUser.permissions || {}
    return permissions[permission] === true
  } catch (error) {
    console.error("Error checking user permission:", error)
    return false
  }
}
