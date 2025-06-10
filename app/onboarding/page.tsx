import { redirect } from "next/navigation"

import { OnboardingForm } from "@/components/onboarding/onboarding-form"
import { getCurrentUser } from "@/lib/session"
import { getTenantDetails } from "@/lib/tenant"

export default async function OnboardingPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  const tenant = await getTenantDetails(user.id)

  if (tenant) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Set up your dental clinic</h1>
          <p className="text-sm text-muted-foreground">Complete your clinic profile to get started</p>
        </div>
        <OnboardingForm user={user} />
      </div>
    </div>
  )
}
