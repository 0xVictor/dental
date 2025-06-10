import type React from "react"
import { redirect } from "next/navigation"

import { DashboardNav } from "@/components/dashboard/nav"
import { DashboardHeader } from "@/components/dashboard/header"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails, getUserTenants } from "@/lib/tenant"
import { NotificationProvider } from "@/components/notifications/notification-provider"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    console.log("Starting DashboardLayout...")

    const user = await getCurrentUser()
    console.log("User:", user?.id || "No user")

    if (!user) {
      console.log("No user found, redirecting to login")
      redirect("/login")
    }

    const tenant = await getTenantDetails(user.id)
    console.log("Tenant:", tenant?.id || "No tenant")

    if (!tenant) {
      console.log("No tenant found, redirecting to onboarding")
      redirect("/onboarding")
    }

    // Get all tenants for the tenant switcher
    let userTenants = []
    try {
      userTenants = await getUserTenants(user.id)
      console.log("User tenants:", userTenants.length)
    } catch (error) {
      console.error("Error getting user tenants:", error)
      // Continue without user tenants
    }

    // Transform userTenants to match expected format
    const transformedTenants = userTenants
      .filter((t) => t && t.tenants) // Filter out invalid entries
      .map((t) => ({
        id: t.tenant_id,
        name: t.tenants?.name || "Unknown",
        role: t.role,
      }))

    console.log("Transformed tenants:", transformedTenants.length)

    return (
      <NotificationProvider tenantId={tenant.id}>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader user={user} tenant={tenant} userTenants={transformedTenants} />
          <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
            <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
              <div className="h-full py-6 pr-6 lg:py-8">
                <DashboardNav tenant={tenant} />
              </div>
            </aside>
            <main className="flex w-full flex-col overflow-hidden py-6 lg:py-8">{children}</main>
          </div>
        </div>
      </NotificationProvider>
    )
  } catch (error) {
    console.error("Error in DashboardLayout:", error)
    redirect("/login")
  }
}
