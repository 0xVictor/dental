import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getMedicalRecords(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: records, error } = await supabase
      .from("medical_records")
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

    return records || []
  } catch (error) {
    console.error("Error fetching medical records:", error)
    return []
  }
}

export async function createMedicalRecord(data: {
  tenantId: string
  patientId: string
  appointmentId?: string
  recordType: string
  title: string
  description?: string
  diagnosis: string
  treatment: string
  medications?: string
  notes?: string
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: record, error } = await supabase
    .from("medical_records")
    .insert({
      tenant_id: data.tenantId,
      patient_id: data.patientId,
      appointment_id: data.appointmentId,
      record_type: data.recordType,
      title: data.title,
      description: data.description,
      diagnosis: data.diagnosis,
      treatment: data.treatment,
      medications: data.medications,
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return record
}
