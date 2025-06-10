"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createAppointmentAction(formData: FormData) {
  console.log("📅 [CREATE_APPOINTMENT] Starting appointment creation")

  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    console.log("📝 [CREATE_APPOINTMENT] Form data received:")
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}: ${value}`)
    }

    // Get current user and tenant
    console.log("🔐 [CREATE_APPOINTMENT] Verifying user authentication...")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("❌ [CREATE_APPOINTMENT] Authentication error:", userError)
      return { error: "User authentication error: " + userError.message }
    }

    if (!user) {
      console.error("❌ [CREATE_APPOINTMENT] User not found")
      return { error: "User not authenticated" }
    }

    console.log("✅ [CREATE_APPOINTMENT] User authenticated:", user.id)

    console.log("🏢 [CREATE_APPOINTMENT] Fetching user tenant...")
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("id, plan")
      .eq("user_id", user.id)
      .single()

    if (tenantError) {
      console.error("❌ [CREATE_APPOINTMENT] Tenant fetch error:", tenantError)
      return { error: "Tenant error: " + tenantError.message }
    }

    if (!tenant) {
      console.error("❌ [CREATE_APPOINTMENT] Tenant not found")
      return { error: "Tenant not found" }
    }

    console.log("✅ [CREATE_APPOINTMENT] Tenant found:", tenant.id)

    // Extract form data
    const patientId = formData.get("patientId") as string
    const appointmentDate = formData.get("appointmentDate") as string
    const appointmentTime = formData.get("appointmentTime") as string
    const duration = Number.parseInt(formData.get("duration") as string)
    const type = formData.get("type") as string
    const room = formData.get("room") as string
    const notes = formData.get("notes") as string
    const status = formData.get("status") as string

    console.log("📋 [CREATE_APPOINTMENT] Extracted data:")
    console.log("  Patient ID:", patientId)
    console.log("  Date:", appointmentDate)
    console.log("  Time:", appointmentTime)
    console.log("  Duration:", duration)
    console.log("  Type:", type)
    console.log("  Status:", status)

    // Validate required fields
    console.log("✅ [CREATE_APPOINTMENT] Validating required fields...")

    if (!patientId) {
      console.error("❌ [CREATE_APPOINTMENT] Patient not selected")
      return { error: "Please select a patient." }
    }

    if (!appointmentDate) {
      console.error("❌ [CREATE_APPOINTMENT] Date not provided")
      return { error: "Appointment date is required." }
    }

    if (!appointmentTime) {
      console.error("❌ [CREATE_APPOINTMENT] Time not provided")
      return { error: "Appointment time is required." }
    }

    if (!duration || duration < 15) {
      console.error("❌ [CREATE_APPOINTMENT] Invalid duration:", duration)
      return { error: "Duration must be at least 15 minutes." }
    }

    if (!status || !["scheduled", "confirmed", "cancelled"].includes(status)) {
      console.error("❌ [CREATE_APPOINTMENT] Invalid status:", status)
      return { error: "Please select a valid status." }
    }

    console.log("✅ [CREATE_APPOINTMENT] Validation completed")

    // Check if patient belongs to this tenant
    console.log("🔍 [CREATE_APPOINTMENT] Verifying patient belongs to tenant...")
    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .select("id, name")
      .eq("id", patientId)
      .eq("tenant_id", tenant.id)
      .single()

    if (patientError) {
      console.error("❌ [CREATE_APPOINTMENT] Patient verification error:", patientError)
      return { error: "Patient verification error: " + patientError.message }
    }

    if (!patient) {
      console.error("❌ [CREATE_APPOINTMENT] Patient not found or doesn't belong to tenant")
      return { error: "Patient not found or access denied." }
    }

    console.log("✅ [CREATE_APPOINTMENT] Patient verified:", patient.name)

    // Check for conflicting appointments (only for non-cancelled appointments)
    console.log("🔍 [CREATE_APPOINTMENT] Checking for time conflicts...")
    const { data: conflictingAppointments, error: conflictError } = await supabase
      .from("appointments")
      .select("id, patient_id")
      .eq("tenant_id", tenant.id)
      .eq("appointment_date", appointmentDate)
      .eq("appointment_time", appointmentTime)
      .neq("status", "cancelled")

    if (conflictError) {
      console.error("❌ [CREATE_APPOINTMENT] Conflict check error:", conflictError)
      // Continue anyway, this is not critical
    }

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      console.warn("⚠️ [CREATE_APPOINTMENT] Time conflict found:", conflictingAppointments)
      return { error: "There is already an appointment scheduled at this time." }
    }

    console.log("✅ [CREATE_APPOINTMENT] No conflicts found")

    // Prepare appointment data
    const appointmentData = {
      tenant_id: tenant.id,
      patient_id: patientId,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      duration,
      type: type || "General", // Default type if not provided
      room: room || null,
      notes: notes || null,
      status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("💾 [CREATE_APPOINTMENT] Data prepared for insertion:")
    console.log(JSON.stringify(appointmentData, null, 2))

    // Create appointment
    console.log("💾 [CREATE_APPOINTMENT] Inserting appointment into database...")
    const { data: appointment, error } = await supabase.from("appointments").insert(appointmentData).select().single()

    if (error) {
      console.error("❌ [CREATE_APPOINTMENT] Database insertion error:", error)
      console.error("❌ [CREATE_APPOINTMENT] Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return { error: "Database insertion error: " + error.message }
    }

    if (!appointment) {
      console.error("❌ [CREATE_APPOINTMENT] Appointment not returned after insertion")
      return { error: "Appointment was not created properly" }
    }

    console.log("✅ [CREATE_APPOINTMENT] Appointment created successfully:", appointment.id)

    // Revalidate relevant pages
    console.log("🔄 [CREATE_APPOINTMENT] Revalidating cache...")
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar")
    revalidatePath("/dashboard/patients")

    console.log("🎉 [CREATE_APPOINTMENT] Process completed successfully!")
    return {
      success: true,
      message: "Appointment created successfully",
      appointment,
    }
  } catch (error: any) {
    console.error("💥 [CREATE_APPOINTMENT] Uncaught error:", error)
    console.error("💥 [CREATE_APPOINTMENT] Stack trace:", error.stack)
    return {
      error: error.message || "Failed to create appointment. Please try again.",
    }
  }
}

export async function updateAppointmentAction(appointmentId: string, formData: FormData) {
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
    const appointmentDate = formData.get("appointmentDate") as string
    const appointmentTime = formData.get("appointmentTime") as string
    const duration = Number.parseInt(formData.get("duration") as string)
    const type = formData.get("type") as string
    const room = formData.get("room") as string
    const notes = formData.get("notes") as string
    const status = formData.get("status") as string

    // Update appointment
    const { data: appointment, error } = await supabase
      .from("appointments")
      .update({
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration,
        type: type || "General",
        room: room || null,
        notes: notes || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId)
      .eq("tenant_id", tenant.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating appointment:", error)
      throw error
    }

    // Revalidate relevant pages
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/calendar")
    revalidatePath("/dashboard/patients")

    return {
      success: true,
      message: "Appointment updated successfully",
      appointment,
    }
  } catch (error: any) {
    console.error("Error updating appointment:", error)
    return {
      error: error.message || "Failed to update appointment. Please try again.",
    }
  }
}
