import { redirect } from "next/navigation"

import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"
import { getPatientDetails } from "@/lib/patients"
import { PatientProfile } from "@/components/patients/patient-profile"

interface PatientPageProps {
  params: {
    id: string
  }
}

export default async function PatientPage({ params }: PatientPageProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    redirect("/onboarding")
  }

  const patient = await getPatientDetails(params.id, tenant.id)

  if (!patient) {
    redirect("/dashboard/patients")
  }

  return <PatientProfile patient={patient} tenant={tenant} />
}
