"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function saveOdontogramAction(patientId: string, teethData: any) {
  console.log("🦷 [SAVE_ODONTOGRAM] Iniciando salvamento do odontograma")
  console.log("🦷 [SAVE_ODONTOGRAM] Paciente:", patientId)
  console.log("🦷 [SAVE_ODONTOGRAM] Dados:", JSON.stringify(teethData).substring(0, 100) + "...")

  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user and tenant
    console.log("🔐 [SAVE_ODONTOGRAM] Verificando autenticação do usuário...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ [SAVE_ODONTOGRAM] Erro de autenticação:", userError)
      return { error: "User not authenticated" }
    }

    console.log("✅ [SAVE_ODONTOGRAM] Usuário autenticado:", user.id)

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (tenantError || !tenant) {
      console.error("❌ [SAVE_ODONTOGRAM] Erro ao buscar tenant:", tenantError)
      return { error: "Tenant not found" }
    }

    console.log("✅ [SAVE_ODONTOGRAM] Tenant encontrado:", tenant.id)

    // Validate required fields
    if (!patientId) {
      console.error("❌ [SAVE_ODONTOGRAM] ID do paciente não fornecido")
      return { error: "Patient ID is required." }
    }

    if (!teethData || !Array.isArray(teethData)) {
      console.error("❌ [SAVE_ODONTOGRAM] Dados dos dentes inválidos")
      return { error: "Invalid teeth data." }
    }

    // Check if patient belongs to this tenant
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("tenant_id", tenant.id)
      .single()

    if (patientError || !patient) {
      console.error("❌ [SAVE_ODONTOGRAM] Paciente não encontrado ou não pertence ao tenant:", patientError)
      return { error: "Patient not found or access denied." }
    }

    console.log("✅ [SAVE_ODONTOGRAM] Paciente verificado:", patient.id)

    // Check if odontogram already exists for this patient
    console.log("🔍 [SAVE_ODONTOGRAM] Verificando se já existe odontograma para este paciente...")
    const { data: existingOdontogram, error: existingError } = await supabase
      .from("odontogram")
      .select("id")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenant.id)
      .single()

    const now = new Date().toISOString()

    if (existingOdontogram) {
      console.log("📝 [SAVE_ODONTOGRAM] Atualizando odontograma existente:", existingOdontogram.id)
      // Update existing odontogram
      const { data: odontogram, error } = await supabase
        .from("odontogram")
        .update({
          teeth_data: teethData,
          updated_at: now,
        })
        .eq("id", existingOdontogram.id)
        .eq("tenant_id", tenant.id)
        .select()
        .single()

      if (error) {
        console.error("❌ [SAVE_ODONTOGRAM] Erro ao atualizar odontograma:", error)
        return { error: "Failed to update odontogram: " + error.message }
      }

      console.log("✅ [SAVE_ODONTOGRAM] Odontograma atualizado com sucesso")
    } else {
      console.log("📝 [SAVE_ODONTOGRAM] Criando novo odontograma")
      // Create new odontogram
      const { data: odontogram, error } = await supabase
        .from("odontogram")
        .insert({
          tenant_id: tenant.id,
          patient_id: patientId,
          teeth_data: teethData,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single()

      if (error) {
        console.error("❌ [SAVE_ODONTOGRAM] Erro ao criar odontograma:", error)
        return { error: "Failed to create odontogram: " + error.message }
      }

      console.log("✅ [SAVE_ODONTOGRAM] Odontograma criado com sucesso:", odontogram.id)
    }

    // Revalidate relevant pages
    revalidatePath(`/dashboard/patients/${patientId}`)

    console.log("🎉 [SAVE_ODONTOGRAM] Processo concluído com sucesso!")
    return {
      success: true,
      message: "Odontogram saved successfully",
    }
  } catch (error: any) {
    console.error("💥 [SAVE_ODONTOGRAM] Erro não capturado:", error)
    return {
      error: error.message || "Failed to save odontogram. Please try again.",
    }
  }
}

export async function getOdontogramAction(patientId: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Get current user and tenant
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { error: "User not authenticated" }
    }

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (tenantError || !tenant) {
      return { error: "Tenant not found" }
    }

    // Get odontogram data
    const { data: odontogram, error } = await supabase
      .from("odontogram")
      .select("*")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenant.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return { error: "Failed to get odontogram: " + error.message }
    }

    return {
      success: true,
      data: odontogram || null,
    }
  } catch (error: any) {
    return {
      error: error.message || "Failed to get odontogram. Please try again.",
    }
  }
}
