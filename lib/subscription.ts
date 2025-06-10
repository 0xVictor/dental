import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function getSubscription(tenantId: string) {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("tenant_id", tenantId)
      .single()

    if (error) {
      return null
    }

    return subscription
  } catch (error) {
    return null
  }
}

export function checkPlanLimit({
  plan,
  currentCount,
  resourceName,
}: {
  plan: string
  currentCount: number
  resourceName: string
}) {
  const limits = {
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

  const planLimits = limits[plan as keyof typeof limits]
  const limit = planLimits[resourceName as keyof typeof planLimits]

  return currentCount < limit
}

export function getPlanFeatures(plan: string) {
  const features = {
    free: ["Up to 50 patients", "Basic appointment scheduling", "Patient records", "Email support"],
    pro: [
      "Unlimited patients",
      "Advanced scheduling",
      "Complete medical records",
      "Financial management",
      "Document storage (50GB)",
      "SMS/Email reminders",
      "Advanced reporting",
      "Priority support",
    ],
    enterprise: [
      "Everything in Pro",
      "Multi-location support",
      "Custom integrations",
      "White-label branding",
      "Unlimited storage",
      "API access",
      "Custom reporting",
      "Dedicated support",
      "Training & onboarding",
    ],
  }

  return features[plan as keyof typeof features] || []
}
