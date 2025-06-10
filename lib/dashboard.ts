import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getDashboardStats(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get total patients count
    const { count: totalPatients } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active")

    // Get appointments for next 7 days
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { count: upcomingAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("appointment_date", new Date().toISOString().split("T")[0])
      .lte("appointment_date", nextWeek.toISOString().split("T")[0])
      .in("status", ["scheduled", "confirmed"])

    // Get revenue for current month
    const currentMonth = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)

    const { data: revenueData } = await supabase
      .from("financial_transactions")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("transaction_type", "payment")
      .eq("status", "completed")
      .gte("transaction_date", firstDayOfMonth.toISOString())

    const totalRevenue = revenueData?.reduce((sum, transaction) => sum + Number.parseFloat(transaction.amount), 0) || 0

    // Get active treatments count
    const { count: activeTreatments } = await supabase
      .from("medical_records")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("record_type", "treatment")
      .neq("status", "completed")

    // Calculate previous month data for comparison
    const previousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    const lastDayOfPreviousMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0)

    const { data: previousRevenueData } = await supabase
      .from("financial_transactions")
      .select("amount")
      .eq("tenant_id", tenantId)
      .eq("transaction_type", "payment")
      .eq("status", "completed")
      .gte("transaction_date", previousMonth.toISOString())
      .lte("transaction_date", lastDayOfPreviousMonth.toISOString())

    const previousRevenue =
      previousRevenueData?.reduce((sum, transaction) => sum + Number.parseFloat(transaction.amount), 0) || 0

    // Calculate percentage changes
    const revenueChange = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0

    // Get patient growth (new patients this month vs last month)
    const { count: newPatientsThisMonth } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", firstDayOfMonth.toISOString())

    const { count: newPatientsLastMonth } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", previousMonth.toISOString())
      .lte("created_at", lastDayOfPreviousMonth.toISOString())

    const patientGrowth =
      newPatientsLastMonth > 0 ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100 : 0

    return {
      totalPatients: totalPatients || 0,
      upcomingAppointments: upcomingAppointments || 0,
      totalRevenue,
      activeTreatments: activeTreatments || 0,
      revenueChange,
      patientGrowth,
      newPatientsThisMonth: newPatientsThisMonth || 0,
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      totalPatients: 0,
      upcomingAppointments: 0,
      totalRevenue: 0,
      activeTreatments: 0,
      revenueChange: 0,
      patientGrowth: 0,
      newPatientsThisMonth: 0,
    }
  }
}

export async function getRecentPatients(tenantId: string, limit = 5) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: patients, error } = await supabase
      .from("patients")
      .select(`
        id,
        name,
        email,
        phone,
        status,
        created_at,
        appointments!inner(
          appointment_date,
          status
        )
      `)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    // Process patients to get last visit and next visit
    const processedPatients =
      patients?.map((patient) => {
        const appointments = patient.appointments || []
        const pastAppointments = appointments
          .filter((apt) => new Date(apt.appointment_date) < new Date() && apt.status === "completed")
          .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())

        const futureAppointments = appointments
          .filter(
            (apt) => new Date(apt.appointment_date) >= new Date() && ["scheduled", "confirmed"].includes(apt.status),
          )
          .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())

        return {
          id: patient.id,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          status: patient.status,
          lastVisit: pastAppointments[0]?.appointment_date || null,
          nextVisit: futureAppointments[0]?.appointment_date || null,
        }
      }) || []

    return processedPatients
  } catch (error) {
    console.error("Error fetching recent patients:", error)
    return []
  }
}

export async function getTodaysAppointments(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const today = new Date().toISOString().split("T")[0]

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_time,
        duration,
        type,
        status,
        room,
        notes,
        patients (
          id,
          name,
          phone
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("appointment_date", today)
      .order("appointment_time", { ascending: true })

    if (error) throw error

    return (
      appointments?.map((appointment) => ({
        id: appointment.id,
        patientName: appointment.patients?.name || "Unknown Patient",
        patientPhone: appointment.patients?.phone || "",
        time: appointment.appointment_time,
        duration: appointment.duration,
        type: appointment.type,
        status: appointment.status,
        room: appointment.room,
        notes: appointment.notes,
      })) || []
    )
  } catch (error) {
    console.error("Error fetching today's appointments:", error)
    return []
  }
}

export async function getUpcomingAppointments(tenantId: string, limit = 4) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const today = new Date().toISOString().split("T")[0]
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        duration,
        type,
        status,
        room,
        patients (
          id,
          name
        )
      `)
      .eq("tenant_id", tenantId)
      .gte("appointment_date", today)
      .lte("appointment_date", nextWeek.toISOString().split("T")[0])
      .in("status", ["scheduled", "confirmed"])
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true })
      .limit(limit)

    if (error) throw error

    return (
      appointments?.map((appointment) => ({
        id: appointment.id,
        patientName: appointment.patients?.name || "Unknown Patient",
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        duration: appointment.duration,
        type: appointment.type,
        room: appointment.room,
        status: appointment.status,
      })) || []
    )
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error)
    return []
  }
}

export async function getPlanUsage(tenantId: string, plan: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    // Get current counts
    const { count: patientsCount } = await supabase
      .from("patients")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active")

    const { count: staffCount } = await supabase
      .from("staff")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "active")

    // Calculate storage usage (sum of all document file sizes)
    const { data: documents } = await supabase.from("documents").select("file_size").eq("tenant_id", tenantId)

    const totalStorageBytes = documents?.reduce((sum, doc) => sum + (doc.file_size || 0), 0) || 0
    const totalStorageGB = totalStorageBytes / (1024 * 1024 * 1024) // Convert to GB

    // Define plan limits
    const planLimits = {
      free: {
        patients: 50,
        storage: 1, // GB
        staff: 3,
      },
      pro: {
        patients: Number.POSITIVE_INFINITY,
        storage: 50, // GB
        staff: Number.POSITIVE_INFINITY,
      },
      enterprise: {
        patients: Number.POSITIVE_INFINITY,
        storage: Number.POSITIVE_INFINITY,
        staff: Number.POSITIVE_INFINITY,
      },
    }

    const limits = planLimits[plan as keyof typeof planLimits] || planLimits.free

    return {
      patients: {
        used: patientsCount || 0,
        limit: limits.patients,
        percentage:
          limits.patients === Number.POSITIVE_INFINITY
            ? 0
            : Math.min(((patientsCount || 0) / limits.patients) * 100, 100),
      },
      storage: {
        used: totalStorageGB,
        limit: limits.storage,
        unit: "GB",
        percentage:
          limits.storage === Number.POSITIVE_INFINITY ? 0 : Math.min((totalStorageGB / limits.storage) * 100, 100),
      },
      staff: {
        used: staffCount || 0,
        limit: limits.staff,
        percentage:
          limits.staff === Number.POSITIVE_INFINITY ? 0 : Math.min(((staffCount || 0) / limits.staff) * 100, 100),
      },
    }
  } catch (error) {
    console.error("Error fetching plan usage:", error)
    return {
      patients: { used: 0, limit: 50, percentage: 0 },
      storage: { used: 0, limit: 1, unit: "GB", percentage: 0 },
      staff: { used: 0, limit: 3, percentage: 0 },
    }
  }
}
