import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { BillingForm } from "@/components/billing/billing-form"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getSubscription } from "@/lib/subscription"

export default async function BillingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  const subscription = await getSubscription(tenant.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Billing" text="Manage your subscription and billing details" />
      <BillingForm tenant={tenant} subscription={subscription} />
    </DashboardShell>
  )
}
