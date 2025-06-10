"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createPatientAction(formData: FormData) {
  console.log("🚀 [CREATE_PATIENT] Iniciando criação de paciente")

  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    console.log("📝 [CREATE_PATIENT] Dados do formulário recebidos:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    // Get current user and tenant
    console.log("🔐 [CREATE_PATIENT] Verificando autenticação do usuário...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("❌ [CREATE_PATIENT] Erro de autenticação:", userError)
      return { error: "User authentication error: " + userError.message }
    }

    if (!user) {
      console.error("❌ [CREATE_PATIENT] Usuário não encontrado")
      return { error: "User not authenticated" }
    }

    console.log("✅ [CREATE_PATIENT] Usuário autenticado:", user.id)

    console.log("🏢 [CREATE_PATIENT] Buscando tenant do usuário...")
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, plan")
      .eq("user_id", user.id)
      .single()

    if (tenantError) {
      console.error("❌ [CREATE_PATIENT] Erro ao buscar tenant:", tenantError)
      return { error: "Tenant error: " + tenantError.message }
    }

    if (!tenant) {
      console.error("❌ [CREATE_PATIENT] Tenant não encontrado")
      return { error: "Tenant not found" }
    }

    console.log("✅ [CREATE_PATIENT] Tenant encontrado:", tenant.id, "Plano:", tenant.plan)

    // Extract form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender = formData.get("gender") as string
    const address = formData.get("address") as string
    const emergencyContactName = formData.get("emergencyContactName") as string
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string
    const medicalHistory = formData.get("medicalHistory") as string
    const allergies = formData.get("allergies") as string
    const insurance = formData.get("insurance") as string

    console.log("📋 [CREATE_PATIENT] Dados extraídos do formulário:")
    console.log("  Nome:", name)
    console.log("  Email:", email)
    console.log("  Telefone:", phone)
    console.log("  Data de nascimento:", dateOfBirth)
    console.log("  Gênero:", gender)

    // Validate required fields
    console.log("✅ [CREATE_PATIENT] Validando campos obrigatórios...")

    if (!name || name.length < 2) {
      console.error("❌ [CREATE_PATIENT] Nome inválido:", name)
      return { error: "Name must be at least 2 characters." }
    }

    if (!phone || phone.length < 8) {
      console.error("❌ [CREATE_PATIENT] Telefone inválido:", phone)
      return { error: "Phone number must be at least 8 characters." }
    }

    if (!dateOfBirth) {
      console.error("❌ [CREATE_PATIENT] Data de nascimento não fornecida")
      return { error: "Date of birth is required." }
    }

    if (!gender || !["male", "female", "other"].includes(gender)) {
      console.error("❌ [CREATE_PATIENT] Gênero inválido:", gender)
      return { error: "Please select a valid gender." }
    }

    console.log("✅ [CREATE_PATIENT] Validação concluída com sucesso")

    // Check if patients table exists
    console.log("🔍 [CREATE_PATIENT] Verificando estrutura da tabela patients...")
    const { data: tableInfo, error: tableError } = await supabase.from("patients").select("id").limit(1)

    if (tableError) {
      console.error("❌ [CREATE_PATIENT] Erro ao verificar tabela patients:", tableError)
      return { error: "Database table error: " + tableError.message }
    }

    console.log("✅ [CREATE_PATIENT] Tabela patients acessível")

    // Prepare patient data
    const patientData = {
      tenant_id: tenant.id,
      name,
      email: email || null,
      phone,
      date_of_birth: dateOfBirth,
      gender,
      address: address || null,
      emergency_contact_name: emergencyContactName || null,
      emergency_contact_phone: emergencyContactPhone || null,
      medical_history: medicalHistory || null,
      allergies: allergies || null,
      insurance: insurance || null,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("💾 [CREATE_PATIENT] Dados preparados para inserção:")
    console.log(JSON.stringify(patientData, null, 2))

    // Create patient
    console.log("💾 [CREATE_PATIENT] Inserindo paciente no banco de dados...")
    const { data: patient, error } = await supabase.from("patients").insert(patientData).select().single()

    if (error) {
      console.error("❌ [CREATE_PATIENT] Erro ao inserir paciente:", error)
      console.error("❌ [CREATE_PATIENT] Detalhes do erro:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { error: "Database insertion error: " + error.message }
    }

    if (!patient) {
      console.error("❌ [CREATE_PATIENT] Paciente não foi retornado após inserção")
      return { error: "Patient was not created properly" }
    }

    console.log("✅ [CREATE_PATIENT] Paciente criado com sucesso:", patient.id)

    // Revalidate the patients page
    console.log("🔄 [CREATE_PATIENT] Revalidando cache da página...")
    revalidatePath("/dashboard/patients")

    console.log("🎉 [CREATE_PATIENT] Processo concluído com sucesso!")
    return {
      success: true,
      message: "Patient created successfully",
      patient,
    }
  } catch (error: any) {
    console.error("💥 [CREATE_PATIENT] Erro não capturado:", error)
    console.error("💥 [CREATE_PATIENT] Stack trace:", error.stack)
    return {
      error: error.message || "Failed to create patient. Please try again.",
    }
  }
}

export async function updatePatientAction(patientId: string, formData: FormData) {
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
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const dateOfBirth = formData.get("dateOfBirth") as string
    const gender = formData.get("gender") as string
    const address = formData.get("address") as string
    const emergencyContactName = formData.get("emergencyContactName") as string
    const emergencyContactPhone = formData.get("emergencyContactPhone") as string
    const medicalHistory = formData.get("medicalHistory") as string
    const allergies = formData.get("allergies") as string
    const insurance = formData.get("insurance") as string

    // Update patient
    const { data: patient, error } = await supabase
      .from("patients")
      .update({
        name,
        email: email || null,
        phone,
        date_of_birth: dateOfBirth,
        gender,
        address: address || null,
        emergency_contact_name: emergencyContactName || null,
        emergency_contact_phone: emergencyContactPhone || null,
        medical_history: medicalHistory || null,
        allergies: allergies || null,
        insurance: insurance || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", patientId)
      .eq("tenant_id", tenant.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating patient:", error)
      throw error
    }

    // Revalidate the patients page
    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${patientId}`)

    return {
      success: true,
      message: "Patient updated successfully",
      patient,
    }
  } catch (error: any) {
    console.error("Error updating patient:", error)
    return {
      error: error.message || "Failed to update patient. Please try again.",
    }
  }
}
