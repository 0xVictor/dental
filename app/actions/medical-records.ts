"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createMedicalRecordAction(formData: FormData) {
  console.log("🩺 [CREATE_MEDICAL_RECORD] Iniciando criação de prontuário")

  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    console.log("📝 [CREATE_MEDICAL_RECORD] Dados do formulário recebidos:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    // Get current user and tenant
    console.log("🔐 [CREATE_MEDICAL_RECORD] Verificando autenticação do usuário...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Erro de autenticação:", userError)
      return { error: "User not authenticated" }
    }

    console.log("✅ [CREATE_MEDICAL_RECORD] Usuário autenticado:", user.id)

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (tenantError || !tenant) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Erro ao buscar tenant:", tenantError)
      return { error: "Tenant not found" }
    }

    console.log("✅ [CREATE_MEDICAL_RECORD] Tenant encontrado:", tenant.id)

    // Extract form data
    const patientId = formData.get("patientId") as string
    const appointmentId = (formData.get("appointmentId") as string) || null
    const recordType = formData.get("recordType") as string
    const title = formData.get("title") as string
    const diagnosis = formData.get("diagnosis") as string
    const treatment = formData.get("treatment") as string
    const medications = formData.get("medications") as string
    const notes = formData.get("notes") as string

    // Validate required fields
    if (!patientId) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Paciente não selecionado")
      return { error: "Please select a patient." }
    }

    if (!recordType) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Tipo de registro não selecionado")
      return { error: "Please select a record type." }
    }

    if (!title || title.length < 2) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Título inválido:", title)
      return { error: "Title must be at least 2 characters." }
    }

    if (!diagnosis || diagnosis.length < 5) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Diagnóstico inválido:", diagnosis)
      return { error: "Diagnosis must be at least 5 characters." }
    }

    if (!treatment || treatment.length < 5) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Tratamento inválido:", treatment)
      return { error: "Treatment must be at least 5 characters." }
    }

    console.log("✅ [CREATE_MEDICAL_RECORD] Validação concluída")

    // Check if patient belongs to this tenant
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("tenant_id", tenant.id)
      .single()

    if (patientError || !patient) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Paciente não encontrado ou não pertence ao tenant:", patientError)
      return { error: "Patient not found or access denied." }
    }

    console.log("✅ [CREATE_MEDICAL_RECORD] Paciente verificado:", patient.id)

    // Create medical record
    const recordData = {
      tenant_id: tenant.id,
      patient_id: patientId,
      appointment_id: appointmentId || null,
      record_type: recordType,
      title,
      diagnosis,
      treatment,
      medications: medications || null,
      notes: notes || null,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("💾 [CREATE_MEDICAL_RECORD] Dados preparados para inserção:")
    console.log(JSON.stringify(recordData, null, 2))

    const { data: record, error } = await supabase.from("medical_records").insert(recordData).select().single()

    if (error) {
      console.error("❌ [CREATE_MEDICAL_RECORD] Erro ao inserir registro:", error)
      return { error: "Failed to create medical record: " + error.message }
    }

    console.log("✅ [CREATE_MEDICAL_RECORD] Registro criado com sucesso:", record.id)

    // Revalidate relevant pages
    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/records")

    console.log("🎉 [CREATE_MEDICAL_RECORD] Processo concluído com sucesso!")
    return {
      success: true,
      message: "Medical record created successfully",
      record,
    }
  } catch (error: any) {
    console.error("💥 [CREATE_MEDICAL_RECORD] Erro não capturado:", error)
    return {
      error: error.message || "Failed to create medical record. Please try again.",
    }
  }
}

export async function updateMedicalRecordAction(recordId: string, formData: FormData) {
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

    // Extract form data
    const recordType = formData.get("recordType") as string
    const title = formData.get("title") as string
    const diagnosis = formData.get("diagnosis") as string
    const treatment = formData.get("treatment") as string
    const medications = formData.get("medications") as string
    const notes = formData.get("notes") as string
    const status = formData.get("status") as string

    // Update medical record
    const { data: record, error } = await supabase
      .from("medical_records")
      .update({
        record_type: recordType,
        title,
        diagnosis,
        treatment,
        medications: medications || null,
        notes: notes || null,
        status: status || "active",
        updated_at: new Date().toISOString(),
      })
      .eq("id", recordId)
      .eq("tenant_id", tenant.id)
      .select()
      .single()

    if (error) {
      return { error: "Failed to update medical record: " + error.message }
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${record.patient_id}`)
    revalidatePath("/dashboard/records")

    return {
      success: true,
      message: "Medical record updated successfully",
      record,
    }
  } catch (error: any) {
    return {
      error: error.message || "Failed to update medical record. Please try again.",
    }
  }
}
