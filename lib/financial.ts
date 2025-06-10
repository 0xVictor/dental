import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getFinancialData(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: transactions, error } = await supabase
      .from("financial_transactions")
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
      .order("transaction_date", { ascending: false })

    if (error) {
      throw error
    }

    // Calculate financial metrics
    const totalRevenue =
      transactions
        ?.filter((t) => t.transaction_type === "payment" && t.status === "completed")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0) || 0

    const outstanding =
      transactions
        ?.filter((t) => t.transaction_type === "payment" && t.status === "pending")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0) || 0

    const collected =
      transactions
        ?.filter((t) => t.transaction_type === "payment" && t.status === "completed")
        .reduce((sum, t) => sum + Number.parseFloat(t.amount), 0) || 0

    return {
      transactions: transactions || [],
      metrics: {
        totalRevenue,
        outstanding,
        collected,
        avgTransaction: transactions?.length ? totalRevenue / transactions.length : 0,
      },
    }
  } catch (error) {
    console.error("Error fetching financial data:", error)
    return {
      transactions: [],
      metrics: {
        totalRevenue: 0,
        outstanding: 0,
        collected: 0,
        avgTransaction: 0,
      },
    }
  }
}

export async function createTransaction(data: {
  tenantId: string
  patientId: string
  appointmentId?: string
  transactionType: "payment" | "refund" | "adjustment"
  amount: number
  currency?: string
  description?: string
  paymentMethod?: string
  status?: "pending" | "completed" | "failed" | "cancelled"
}) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  const { data: transaction, error } = await supabase
    .from("financial_transactions")
    .insert({
      tenant_id: data.tenantId,
      patient_id: data.patientId,
      appointment_id: data.appointmentId,
      transaction_type: data.transactionType,
      amount: data.amount,
      currency: data.currency || "USD",
      description: data.description,
      payment_method: data.paymentMethod,
      status: data.status || "pending",
      transaction_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return transaction
}
