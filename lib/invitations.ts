import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getInvitations(tenantId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: invitations, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching invitations:", error)
      return []
    }

    return invitations || []
  } catch (error) {
    console.error("Error in getInvitations:", error)
    return []
  }
}

export async function getTeamMembers(tenantId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    const { data: members, error } = await supabase
      .from("tenant_users")
      .select(`
        id,
        role,
        status,
        joined_at,
        auth.users (
          email,
          raw_user_meta_data
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("status", "active")
      .order("joined_at", { ascending: false })

    if (error) {
      console.error("Error fetching team members:", error)
      return []
    }

    // Transform the data to match our interface
    const transformedMembers =
      members?.map((member) => ({
        id: member.id,
        name: member.auth?.users?.raw_user_meta_data?.name || "Unknown",
        email: member.auth?.users?.email || "Unknown",
        role: member.role,
        status: member.status,
        joined_at: member.joined_at,
      })) || []

    return transformedMembers
  } catch (error) {
    console.error("Error in getTeamMembers:", error)
    return []
  }
}
