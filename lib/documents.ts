import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getDocuments(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: documents, error } = await supabase
      .from("documents")
      .select(`
        *,
        patients (
          id,
          name
        ),
        appointments (
          id,
          appointment_date,
          type
        )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return documents || []
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

export async function uploadDocument(data: {
  tenantId: string
  patientId: string
  appointmentId?: string
  fileName: string
  fileType: string
  fileSize: number
  fileUrl: string
  documentType?: string
  description?: string
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: document, error } = await supabase
    .from("documents")
    .insert({
      tenant_id: data.tenantId,
      patient_id: data.patientId,
      appointment_id: data.appointmentId,
      file_name: data.fileName,
      file_type: data.fileType,
      file_size: data.fileSize,
      file_url: data.fileUrl,
      document_type: data.documentType,
      description: data.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return document
}

export async function deleteDocument(documentId: string, tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { error } = await supabase.from("documents").delete().eq("id", documentId).eq("tenant_id", tenantId)

  if (error) {
    throw error
  }

  return true
}
