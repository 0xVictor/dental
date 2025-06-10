import type { Metadata } from "next"
import { SettingsForm } from "@/components/settings/settings-form"
import { getTenantDetails } from "@/lib/tenant"
import { getInvitations, getTeamMembers } from "@/lib/invitations"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your clinic settings and team members",
}

export default async function SettingsPage() {
  const session = await getSession()
  if (!session?.user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(session.user.id)
  if (!tenant) {
    redirect("/onboarding")
  }

  // Get current tenant ID
  const currentTenantId = cookies().get("currentTenantId")?.value
  if (!currentTenantId) {
    redirect("/onboarding")
  }

  // Fetch invitations and team members
  const [invitations, members] = await Promise.all([getInvitations(currentTenantId), getTeamMembers(currentTenantId)])

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your clinic settings, team members, and invitations</p>
      </div>
      <SettingsForm tenant={tenant} invitations={invitations} members={members} />
    </div>
  )
}
