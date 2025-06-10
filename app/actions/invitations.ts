"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function sendInvitationAction(formData: FormData) {
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

    // Get current tenant
    const currentTenantId = cookies().get("currentTenantId")?.value
    if (!currentTenantId) {
      return { error: "No clinic selected" }
    }

    // Check if user has permission to invite
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to invite users" }
    }

    // Extract form data
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const role = formData.get("role") as string
    const message = formData.get("message") as string

    // Validate required fields
    if (!email || !name || !role) {
      return { error: "Please fill in all required fields" }
    }

    if (!["admin", "dentist", "hygienist", "assistant", "secretary"].includes(role)) {
      return { error: "Invalid role selected" }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("tenant_users")
      .select("id")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .single()

    if (existingMember) {
      return { error: "This user is already a member of your clinic" }
    }

    // Check if there's already a pending invitation
    const { data: existingInvitation } = await supabase
      .from("invitations")
      .select("id")
      .eq("tenant_id", currentTenantId)
      .eq("email", email)
      .eq("status", "pending")
      .single()

    if (existingInvitation) {
      return { error: "There's already a pending invitation for this email" }
    }

    // Create invitation
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expires in 7 days

    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .insert({
        tenant_id: currentTenantId,
        email: email,
        name: name,
        role: role,
        message: message || null,
        token: token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (invitationError) {
      console.error("Error creating invitation:", invitationError)
      throw invitationError
    }

    // TODO: Send invitation email
    console.log(`Invitation sent to ${email} with token ${token}`)

    revalidatePath("/dashboard/settings")
    return {
      success: true,
      message: "Invitation sent successfully",
      invitationId: invitation.id,
    }
  } catch (error: any) {
    console.error("Error sending invitation:", error)
    return {
      error: error.message || "Failed to send invitation. Please try again.",
    }
  }
}

export async function acceptInvitationAction(token: string, userData: { password: string }) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .eq("status", "pending")
      .single()

    if (invitationError || !invitation) {
      return { error: "Invalid or expired invitation" }
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return { error: "This invitation has expired" }
    }

    // Create user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.email,
      password: userData.password,
      options: {
        data: {
          name: invitation.name,
        },
      },
    })

    if (authError) {
      console.error("Error creating user account:", authError)
      return { error: "Failed to create user account" }
    }

    if (!authData.user) {
      return { error: "Failed to create user account" }
    }

    // Add user to tenant
    const { error: tenantUserError } = await supabase.from("tenant_users").insert({
      tenant_id: invitation.tenant_id,
      user_id: authData.user.id,
      role: invitation.role,
      status: "active",
      joined_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (tenantUserError) {
      console.error("Error adding user to tenant:", tenantUserError)
      return { error: "Failed to add user to clinic" }
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "accepted",
        accepted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitation.id)

    if (updateError) {
      console.error("Error updating invitation status:", updateError)
    }

    return {
      success: true,
      message: "Invitation accepted successfully",
    }
  } catch (error: any) {
    console.error("Error accepting invitation:", error)
    return {
      error: error.message || "Failed to accept invitation. Please try again.",
    }
  }
}

export async function declineInvitationAction(token: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Update invitation status
    const { error } = await supabase
      .from("invitations")
      .update({
        status: "declined",
        declined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("token", token)
      .eq("status", "pending")

    if (error) {
      console.error("Error declining invitation:", error)
      return { error: "Failed to decline invitation" }
    }

    return {
      success: true,
      message: "Invitation declined",
    }
  } catch (error: any) {
    console.error("Error declining invitation:", error)
    return {
      error: error.message || "Failed to decline invitation. Please try again.",
    }
  }
}

export async function resendInvitationAction(invitationId: string) {
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

    // Get current tenant
    const currentTenantId = cookies().get("currentTenantId")?.value
    if (!currentTenantId) {
      return { error: "No clinic selected" }
    }

    // Check permissions
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to resend invitations" }
    }

    // Generate new token and extend expiry
    const newToken = crypto.randomUUID()
    const newExpiresAt = new Date()
    newExpiresAt.setDate(newExpiresAt.getDate() + 7)

    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        token: newToken,
        expires_at: newExpiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("tenant_id", currentTenantId)

    if (updateError) {
      console.error("Error resending invitation:", updateError)
      return { error: "Failed to resend invitation" }
    }

    // TODO: Send new invitation email
    console.log(`Invitation resent with new token ${newToken}`)

    revalidatePath("/dashboard/settings")
    return {
      success: true,
      message: "Invitation resent successfully",
    }
  } catch (error: any) {
    console.error("Error resending invitation:", error)
    return {
      error: error.message || "Failed to resend invitation. Please try again.",
    }
  }
}

export async function revokeInvitationAction(invitationId: string) {
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

    // Get current tenant
    const currentTenantId = cookies().get("currentTenantId")?.value
    if (!currentTenantId) {
      return { error: "No clinic selected" }
    }

    // Check permissions
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to revoke invitations" }
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("invitations")
      .update({
        status: "revoked",
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId)
      .eq("tenant_id", currentTenantId)

    if (updateError) {
      console.error("Error revoking invitation:", updateError)
      return { error: "Failed to revoke invitation" }
    }

    revalidatePath("/dashboard/settings")
    return {
      success: true,
      message: "Invitation revoked successfully",
    }
  } catch (error: any) {
    console.error("Error revoking invitation:", error)
    return {
      error: error.message || "Failed to revoke invitation. Please try again.",
    }
  }
}

export async function updateMemberRoleAction(formData: FormData) {
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

    // Get current tenant
    const currentTenantId = cookies().get("currentTenantId")?.value
    if (!currentTenantId) {
      return { error: "No clinic selected" }
    }

    // Check permissions
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to update member roles" }
    }

    const memberId = formData.get("memberId") as string
    const newRole = formData.get("role") as string

    if (!["admin", "dentist", "hygienist", "assistant", "secretary"].includes(newRole)) {
      return { error: "Invalid role selected" }
    }

    // Check if trying to change owner role
    const { data: memberToUpdate } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("id", memberId)
      .eq("tenant_id", currentTenantId)
      .single()

    if (memberToUpdate?.role === "owner") {
      return { error: "Cannot change the role of the clinic owner" }
    }

    // Update member role
    const { error: updateError } = await supabase
      .from("tenant_users")
      .update({
        role: newRole,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId)
      .eq("tenant_id", currentTenantId)

    if (updateError) {
      console.error("Error updating member role:", updateError)
      return { error: "Failed to update member role" }
    }

    revalidatePath("/dashboard/settings")
    return {
      success: true,
      message: "Member role updated successfully",
    }
  } catch (error: any) {
    console.error("Error updating member role:", error)
    return {
      error: error.message || "Failed to update member role. Please try again.",
    }
  }
}

export async function removeMemberAction(memberId: string) {
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

    // Get current tenant
    const currentTenantId = cookies().get("currentTenantId")?.value
    if (!currentTenantId) {
      return { error: "No clinic selected" }
    }

    // Check permissions
    const { data: tenantUser, error: permissionError } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("tenant_id", currentTenantId)
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (permissionError || !tenantUser || !["owner", "admin"].includes(tenantUser.role)) {
      return { error: "You don't have permission to remove members" }
    }

    // Check if trying to remove owner
    const { data: memberToRemove } = await supabase
      .from("tenant_users")
      .select("role")
      .eq("id", memberId)
      .eq("tenant_id", currentTenantId)
      .single()

    if (memberToRemove?.role === "owner") {
      return { error: "Cannot remove the clinic owner" }
    }

    // Remove member
    const { error: removeError } = await supabase
      .from("tenant_users")
      .delete()
      .eq("id", memberId)
      .eq("tenant_id", currentTenantId)

    if (removeError) {
      console.error("Error removing member:", removeError)
      return { error: "Failed to remove member" }
    }

    revalidatePath("/dashboard/settings")
    return {
      success: true,
      message: "Member removed successfully",
    }
  } catch (error: any) {
    console.error("Error removing member:", error)
    return {
      error: error.message || "Failed to remove member. Please try again.",
    }
  }
}
