import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { Overview } from "@/components/dashboard/overview"
import { RecentPatients } from "@/components/dashboard/recent-patients"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { PlanUsage } from "@/components/dashboard/plan-usage"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getDashboardStats, getRecentPatients, getUpcomingAppointments, getPlanUsage } from "@/lib/dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  // Fetch all dashboard data
  const [stats, recentPatients, upcomingAppointments, planUsage] = await Promise.all([
    getDashboardStats(tenant.id),
    getRecentPatients(tenant.id, 5),
    getUpcomingAppointments(tenant.id, 4),
    getPlanUsage(tenant.id, tenant.plan),
  ])

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="Overview of your dental clinic" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Overview stats={stats} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <UpcomingAppointments appointments={upcomingAppointments} className="col-span-4" />
        <PlanUsage usage={planUsage} plan={tenant.plan} className="col-span-3" />
      </div>
      <RecentPatients patients={recentPatients} />
    </DashboardShell>
  )
}
