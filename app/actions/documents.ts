"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function uploadDocumentAction(formData: FormData) {
  console.log("📄 [UPLOAD_DOCUMENT] Iniciando upload de documento")

  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    console.log("📝 [UPLOAD_DOCUMENT] Dados do formulário recebidos")

    // Get current user and tenant
    console.log("🔐 [UPLOAD_DOCUMENT] Verificando autenticação do usuário...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      console.error("❌ [UPLOAD_DOCUMENT] Erro de autenticação:", userError)
      return { error: "User not authenticated" }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Usuário autenticado:", user.id)

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (tenantError || !tenant) {
      console.error("❌ [UPLOAD_DOCUMENT] Erro ao buscar tenant:", tenantError)
      return { error: "Tenant not found" }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Tenant encontrado:", tenant.id)

    // Extract form data
    const patientId = formData.get("patientId") as string
    const appointmentId = (formData.get("appointmentId") as string) || null
    const documentType = formData.get("documentType") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    // Validate required fields
    if (!patientId) {
      console.error("❌ [UPLOAD_DOCUMENT] Paciente não selecionado")
      return { error: "Please select a patient." }
    }

    if (!documentType) {
      console.error("❌ [UPLOAD_DOCUMENT] Tipo de documento não selecionado")
      return { error: "Please select a document type." }
    }

    if (!file) {
      console.error("❌ [UPLOAD_DOCUMENT] Arquivo não fornecido")
      return { error: "Please select a file to upload." }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Validação concluída")
    console.log("📄 [UPLOAD_DOCUMENT] Arquivo:", file.name, file.type, file.size)

    // Check if patient belongs to this tenant
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("tenant_id", tenant.id)
      .single()

    if (patientError || !patient) {
      console.error("❌ [UPLOAD_DOCUMENT] Paciente não encontrado ou não pertence ao tenant:", patientError)
      return { error: "Patient not found or access denied." }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Paciente verificado:", patient.id)

    // Upload file to storage
    console.log("📤 [UPLOAD_DOCUMENT] Fazendo upload do arquivo para o storage...")
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`
    const filePath = `${tenant.id}/${patientId}/${fileName}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("patient_documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("❌ [UPLOAD_DOCUMENT] Erro ao fazer upload do arquivo:", uploadError)
      return { error: "Failed to upload file: " + uploadError.message }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Arquivo enviado com sucesso:", uploadData.path)

    // Get public URL for the file
    const { data: publicUrlData } = supabase.storage.from("patient_documents").getPublicUrl(filePath)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      console.error("❌ [UPLOAD_DOCUMENT] Erro ao obter URL pública do arquivo")
      return { error: "Failed to get public URL for the file" }
    }

    console.log("🔗 [UPLOAD_DOCUMENT] URL pública obtida:", publicUrlData.publicUrl)

    // Create document record in database
    const documentData = {
      tenant_id: tenant.id,
      patient_id: patientId,
      appointment_id: appointmentId || null,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      file_url: publicUrlData.publicUrl,
      storage_path: filePath,
      document_type: documentType,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("💾 [UPLOAD_DOCUMENT] Dados preparados para inserção:")
    console.log(JSON.stringify(documentData, null, 2))

    const { data: document, error } = await supabase.from("documents").insert(documentData).select().single()

    if (error) {
      console.error("❌ [UPLOAD_DOCUMENT] Erro ao inserir documento no banco de dados:", error)
      return { error: "Failed to create document record: " + error.message }
    }

    console.log("✅ [UPLOAD_DOCUMENT] Documento criado com sucesso:", document.id)

    // Revalidate relevant pages
    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${patientId}`)
    revalidatePath("/dashboard/documents")

    console.log("🎉 [UPLOAD_DOCUMENT] Processo concluído com sucesso!")
    return {
      success: true,
      message: "Document uploaded successfully",
      document,
    }
  } catch (error: any) {
    console.error("💥 [UPLOAD_DOCUMENT] Erro não capturado:", error)
    return {
      error: error.message || "Failed to upload document. Please try again.",
    }
  }
}

export async function deleteDocumentAction(documentId: string) {
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

    // Get document details first to get the storage path
    const { data: document, error: getError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("tenant_id", tenant.id)
      .single()

    if (getError || !document) {
      return { error: "Document not found or access denied" }
    }

    // Delete file from storage if storage_path exists
    if (document.storage_path) {
      const { error: storageError } = await supabase.storage.from("patient_documents").remove([document.storage_path])

      if (storageError) {
        console.error("Error deleting file from storage:", storageError)
        // Continue anyway, we still want to delete the database record
      }
    }

    // Delete document record from database
    const { error } = await supabase.from("documents").delete().eq("id", documentId).eq("tenant_id", tenant.id)

    if (error) {
      return { error: "Failed to delete document: " + error.message }
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard/patients")
    revalidatePath(`/dashboard/patients/${document.patient_id}`)
    revalidatePath("/dashboard/documents")

    return {
      success: true,
      message: "Document deleted successfully",
    }
  } catch (error: any) {
    return {
      error: error.message || "Failed to delete document. Please try again.",
    }
  }
}
