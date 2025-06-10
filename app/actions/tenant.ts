"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createTenantAction(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Extract form data
    const clinicName = formData.get("clinicName") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const plan = formData.get("plan") as string

    // Validate required fields
    if (!clinicName || clinicName.length < 2) {
      return { error: "Clinic name must be at least 2 characters." }
    }

    if (!address || address.length < 5) {
      return { error: "Address must be at least 5 characters." }
    }

    if (!phone || phone.length < 8) {
      return { error: "Phone number must be at least 8 characters." }
    }

    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
      return { error: "Please select a valid plan." }
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: clinicName,
        address: address,
        phone: phone,
        plan: plan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (tenantError) {
      console.error("Error creating tenant:", tenantError)
      throw tenantError
    }

    // Add user as owner of the tenant
    const { error: tenantUserError } = await supabase.from("tenant_users").insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (tenantUserError) {
      console.error("Error creating tenant user relationship:", tenantUserError)
      throw tenantUserError
    }

    // Set the current tenant in cookies
    cookies().set("currentTenantId", tenant.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })

    // Generate sample data for the new tenant
    try {
      await supabase.rpc("generate_sample_data_for_tenant", {
        tenant_uuid: tenant.id,
      })
    } catch (sampleDataError) {
      console.warn("Failed to generate sample data:", sampleDataError)
    }

    revalidatePath("/dashboard")
    revalidatePath("/onboarding")

    return {
      success: true,
      message: "Clinic created successfully",
      tenant,
    }
  } catch (error: any) {
    console.error("Error creating tenant:", error)
    return {
      error: error.message || "Failed to create clinic. Please try again.",
    }
  }
}

export async function inviteStaffAction(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    const tenantId = formData.get("tenantId") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string

    // Check if user has permission to invite staff
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to invite staff" }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("tenant_users")
      .select("id")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .single()

    if (existingUser) {
      return { error: "This email is already associated with your clinic" }
    }

    // Create invitation token
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        tenant_id: tenantId,
        email: email,
        role: role,
        invited_by: user.id,
        token: token,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invitationError) {
      console.error("Error creating invitation:", invitationError)
      throw invitationError
    }

    // TODO: Send invitation email
    console.log(`Invitation created for ${email} with token ${token}`)

    revalidatePath("/dashboard/staff")
    return { id: invitation.id }
  } catch (error: any) {
    console.error("Error inviting staff:", error)
    return {
      error: error.message || "Failed to send invitation. Please try again.",
    }
  }
}

export async function switchTenantAction(tenantId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    // Verify user has access to this tenant
    const { data: tenantUser, error } = await supabase
      .from("tenant_users")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error || !tenantUser) {
      return { error: "You don't have access to this clinic" }
    }

    // Set the current tenant in cookies
    cookies().set("currentTenantId", tenantId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })

    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Switched clinic successfully",
    }
  } catch (error: any) {
    console.error("Error switching tenant:", error)
    return {
      error: error.message || "Failed to switch clinic. Please try again.",
    }
  }
}

export async function updateTenantSettingsAction(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    const tenantId = formData.get("tenantId") as string

    // Check if user has permission to update settings
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to update settings" }
    }

    // Extract form data
    const clinicName = formData.get("clinicName") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const website = formData.get("website") as string
    const description = formData.get("description") as string
    const emailNotifications = formData.get("emailNotifications") === "true"
    const smsNotifications = formData.get("smsNotifications") === "true"
    const appointmentReminders = formData.get("appointmentReminders") === "true"
    const rooms = JSON.parse(formData.get("rooms") as string)
    const appointmentTypes = JSON.parse(formData.get("appointmentTypes") as string)

    // Update tenant
    const { error } = await supabase
      .from("tenants")
      .update({
        name: clinicName,
        address: address,
        phone: phone,
        email: email,
        website: website || null,
        description: description || null,
        email_notifications: emailNotifications,
        sms_notifications: smsNotifications,
        appointment_reminders: appointmentReminders,
        rooms: rooms,
        appointment_types: appointmentTypes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tenantId)

    if (error) {
      console.error("Error updating tenant:", error)
      throw error
    }

    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Settings updated successfully",
    }
  } catch (error: any) {
    console.error("Error updating tenant settings:", error)
    return {
      error: error.message || "Failed to update settings. Please try again.",
    }
  }
}

export async function removeStaffMember(staffUserId: string) {
  const cookieStore = cookies()
  const supabase = createServerActionClient({ cookies: () => cookieStore })

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  // Get current tenant
  const currentTenantId = cookies().get("currentTenantId")?.value
  if (!currentTenantId) {
    throw new Error("No clinic selected")
  }

  // Check if user has permission to remove staff
  const { data: tenantUser, error: permissionError } = await supabase
    .from("tenant_users")
    .select("role")
    .eq("tenant_id", currentTenantId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single()

  if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
    throw new Error("You do not have permission to remove staff members")
  }

  // Check if trying to remove an owner
  const { data: staffToRemove } = await supabase.from("tenant_users").select("role").eq("id", staffUserId).single()

  if (staffToRemove?.role === "owner") {
    throw new Error("Cannot remove the owner of the clinic")
  }

  // Remove the staff member
  const { error: removeError } = await supabase
    .from("tenant_users")
    .delete()
    .eq("id", staffUserId)
    .eq("tenant_id", currentTenantId)

  if (removeError) {
    console.error("Error removing staff member:", removeError)
    throw new Error("Failed to remove staff member")
  }

  revalidatePath("/dashboard/staff")
  return { success: true }
}

export async function createTenant(name: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .insert({
        name: name,
        address: "Address pending",
        phone: "Phone pending",
        plan: "free",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (tenantError) {
      console.error("Error creating tenant:", tenantError)
      throw tenantError
    }

    // Add user as owner of the tenant
    const { error: tenantUserError } = await supabase.from("tenant_users").insert({
      tenant_id: tenant.id,
      user_id: user.id,
      role: "owner",
      status: "active",
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (tenantUserError) {
      console.error("Error creating tenant user relationship:", tenantUserError)
      throw tenantUserError
    }

    // Set the current tenant in cookies
    cookies().set("currentTenantId", tenant.id, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })

    // Generate sample data for the new tenant
    try {
      await supabase.rpc("generate_sample_data_for_tenant", {
        tenant_uuid: tenant.id,
      })
    } catch (sampleDataError) {
      console.warn("Failed to generate sample data:", sampleDataError)
    }

    revalidatePath("/dashboard")

    return tenant.id
  } catch (error: any) {
    console.error("Error creating tenant:", error)
    throw error
  }
}

export async function switchTenant(tenantId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      throw new Error("User not authenticated")
    }

    // Verify user has access to this tenant
    const { data: tenantUser, error } = await supabase
      .from("tenant_users")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (error || !tenantUser) {
      throw new Error("You don't have access to this clinic")
    }

    // Set the current tenant in cookies
    cookies().set("currentTenantId", tenantId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    })

    revalidatePath("/dashboard")

    return true
  } catch (error: any) {
    console.error("Error switching tenant:", error)
    throw error
  }
}
