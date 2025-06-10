import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getPatients(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching patients:", error)
      throw error
    }

    return patients || []
  } catch (error) {
    console.error("Error in getPatients:", error)
    return []
  }
}

export async function getPatientDetails(patientId: string, tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get patient basic info
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", patientId)
      .eq("tenant_id", tenantId)
      .single()

    if (patientError) {
      console.error("Error fetching patient details:", patientError)
      throw patientError
    }

    if (!patient) {
      return null
    }

    // Get patient appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from("appointments")
      .select("*")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenantId)
      .order("appointment_date", { ascending: false })

    if (appointmentsError) {
      console.error("Error fetching patient appointments:", appointmentsError)
    }

    // Get patient medical records
    const { data: medicalRecords, error: recordsError } = await supabase
      .from("medical_records")
      .select("*")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (recordsError) {
      console.error("Error fetching patient medical records:", recordsError)
    }

    // Get patient financial transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from("financial_transactions")
      .select("*")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenantId)
      .order("transaction_date", { ascending: false })

    if (transactionsError) {
      console.error("Error fetching patient transactions:", transactionsError)
    }

    // Get patient documents
    const { data: documents, error: documentsError } = await supabase
      .from("documents")
      .select("*")
      .eq("patient_id", patientId)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })

    if (documentsError) {
      console.error("Error fetching patient documents:", documentsError)
    }

    // Get patient odontogram data (with error handling for missing table)
    let odontogramData = null
    try {
      const { data, error: odontogramError } = await supabase
        .from("odontogram")
        .select("*")
        .eq("patient_id", patientId)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(1)

      if (odontogramError) {
        // Check if it's a "relation does not exist" error
        if (odontogramError.message?.includes('relation "public.odontogram" does not exist')) {
          console.warn("Odontogram table does not exist yet. Please run the odontogram table creation script.")
        } else {
          console.error("Error fetching patient odontogram:", odontogramError)
        }
      } else {
        odontogramData = data?.[0] || null
      }
    } catch (error) {
      console.warn("Could not fetch odontogram data:", error)
    }

    // Return patient with all related data
    return {
      ...patient,
      appointments: appointments || [],
      medicalRecords: medicalRecords || [],
      transactions: transactions || [],
      documents: documents || [],
      odontogram: odontogramData,
    }
  } catch (error) {
    console.error("Error in getPatientDetails:", error)
    return null
  }
}

export async function createPatient(data: {
  tenantId: string
  name: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  address?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  medicalHistory?: string
  allergies?: string
  insurance?: string
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: patient, error } = await supabase
    .from("patients")
    .insert({
      tenant_id: data.tenantId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date_of_birth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      emergency_contact_name: data.emergencyContactName,
      emergency_contact_phone: data.emergencyContactPhone,
      medical_history: data.medicalHistory,
      allergies: data.allergies,
      insurance: data.insurance,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return patient
}
