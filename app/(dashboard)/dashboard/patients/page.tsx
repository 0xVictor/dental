import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { PatientsList } from "@/components/patients/patients-list"
import { getPatients } from "@/lib/patients"
import { getTenantDetails } from "@/lib/tenant"

async function PatientsPageContent() {
  console.log("🏥 [PATIENTS_PAGE] Carregando página de pacientes")

  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Get current user
  console.log("🔐 [PATIENTS_PAGE] Verificando autenticação...")
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    console.error("❌ [PATIENTS_PAGE] Usuário não autenticado:", userError)
    redirect("/login")
  }

  console.log("✅ [PATIENTS_PAGE] Usuário autenticado:", user.id)

  // Get tenant
  console.log("🏢 [PATIENTS_PAGE] Buscando tenant...")
  const tenant = await getTenantDetails(user.id)

  if (!tenant) {
    console.error("❌ [PATIENTS_PAGE] Tenant não encontrado")
    redirect("/onboarding")
  }

  console.log("✅ [PATIENTS_PAGE] Tenant encontrado:", tenant.id, "Plano:", tenant.plan)

  // Get patients
  console.log("👥 [PATIENTS_PAGE] Buscando pacientes...")
  const patients = await getPatients(tenant.id)

  console.log("✅ [PATIENTS_PAGE] Pacientes carregados:", patients?.length || 0)

  if (patients && patients.length > 0) {
    console.log("👥 [PATIENTS_PAGE] Primeiros 3 pacientes:")
    patients.slice(0, 3).forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (${patient.id})`)
    })
  }

  return <PatientsList patients={patients} tenant={tenant} />
}

export default function PatientsPage() {
  console.log("🏥 [PATIENTS_PAGE] Renderizando página de pacientes")

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Patients</h2>
      </div>
      <Suspense fallback={<div>Loading patients...</div>}>
        <PatientsPageContent />
      </Suspense>
    </div>
  )
}
