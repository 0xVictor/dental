import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/shell"
import { DashboardHeader } from "@/components/dashboard/header"
import { DocumentsList } from "@/components/documents/documents-list"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getDocuments } from "@/lib/documents"

export default async function DocumentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  const documents = await getDocuments(tenant.id)

  return (
    <DashboardShell>
      <DashboardHeader heading="Documents" text="Manage patient documents, X-rays, and files" />
      <DocumentsList documents={documents} tenant={tenant} />
    </DashboardShell>
  )
}
