import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { Calendar } from "@/components/calendar/calendar"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getAppointments } from "@/lib/appointments"
import { getPatients } from "@/lib/patients"

export default async function CalendarPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  const [appointments, patients] = await Promise.all([getAppointments(tenant.id), getPatients(tenant.id)])

  return (
    <DashboardShell>
      <DashboardHeader heading="Calendar" text="Manage your appointments" />
      <Calendar appointments={appointments} tenant={tenant} patients={patients} />
    </DashboardShell>
  )
}
