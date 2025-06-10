import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { FinancialDashboard } from "@/components/financial/financial-dashboard"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getFinancialData } from "@/lib/financial"

export default async function FinancialPage() {
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

  const financialData = await getFinancialData(tenant.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Financial Management" text="Track revenue, payments, and financial reports" />
      <FinancialDashboard data={financialData} tenant={tenant} />
    </DashboardShell>
  )
}
