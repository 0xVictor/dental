import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getAppointments(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    console.log("📅 [GET_APPOINTMENTS] Fetching appointments for tenant:", tenantId)

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        patients (
          id,
          name,
          email,
          phone
        )
      `)
      .eq("tenant_id", tenantId)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })

    if (error) {
      console.error("❌ [GET_APPOINTMENTS] Database error:", error)
      throw error
    }

    console.log("✅ [GET_APPOINTMENTS] Found appointments:", appointments?.length || 0)

    // Log each appointment for debugging
    appointments?.forEach((apt, index) => {
      console.log(`📅 [GET_APPOINTMENTS] Appointment ${index + 1}:`, {
        id: apt.id,
        patient: apt.patients?.name,
        date: apt.appointment_date,
        time: apt.appointment_time,
        type: apt.type,
        status: apt.status,
      })
    })

    return appointments || []
  } catch (error) {
    console.error("💥 [GET_APPOINTMENTS] Error fetching appointments:", error)
    return []
  }
}

export async function createAppointment(data: {
  tenantId: string
  patientId: string
  appointmentDate: string
  appointmentTime: string
  duration: number
  type: string
  notes?: string
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  console.log("📅 [CREATE_APPOINTMENT] Creating appointment with data:", data)

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      tenant_id: data.tenantId,
      patient_id: data.patientId,
      appointment_date: data.appointmentDate,
      appointment_time: data.appointmentTime,
      duration: data.duration,
      type: data.type,
      notes: data.notes,
      status: "scheduled",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select(`
      *,
      patients (
        id,
        name,
        email,
        phone
      )
    `)
    .single()

  if (error) {
    console.error("❌ [CREATE_APPOINTMENT] Database error:", error)
    throw error
  }

  console.log("✅ [CREATE_APPOINTMENT] Appointment created:", appointment)
  return appointment
}
