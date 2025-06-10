import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { MedicalRecordsList } from "@/components/medical-records/medical-records-list"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getMedicalRecords } from "@/lib/medical-records"

export default async function MedicalRecordsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  if (tenant.plan === "free") {
    redirect("/dashboard/billing")
  }

  const records = await getMedicalRecords(tenant.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Medical Records" text="Manage patient medical records and treatment plans" />
      <MedicalRecordsList records={records} tenant={tenant} />
    </DashboardShell>
  )
}
