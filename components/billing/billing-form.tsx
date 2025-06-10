"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface BillingFormProps {
  tenant: any
  subscription: any
}

export function BillingForm({ tenant, subscription }: BillingFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      features: ["Up to 50 patients", "Basic appointment scheduling", "Patient records", "Email support"],
      limitations: ["Limited storage (1GB)", "Basic reporting", "No integrations"],
      current: tenant.plan === "free",
    },
    {
      name: "Pro",
      price: "$49",
      period: "per month",
      description: "For growing dental practices",
      features: [
        "Unlimited patients",
        "Advanced scheduling",
        "Complete medical records",
        "Financial management",
        "Document storage (50GB)",
        "SMS/Email reminders",
        "Advanced reporting",
        "Priority support",
      ],
      popular: true,
      current: tenant.plan === "pro",
    },
    {
      name: "Enterprise",
      price: "$149",
      period: "per month",
      description: "For large practices and clinics",
      features: [
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
      current: tenant.plan === "enterprise",
    },
  ]

  const handleUpgrade = async (planName: string) => {
    setIsLoading(true)
    // In a real app, this would integrate with Stripe
    console.log(`Upgrading to ${planName}`)
    setIsLoading(false)
  }

  return (
    <div className="mt-6 space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong>{tenant.plan}</strong> plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold capitalize">{tenant.plan} Plan</div>
              <div className="text-muted-foreground">
                {tenant.plan === "free" && "Free forever"}
                {tenant.plan === "pro" && "$49/month"}
                {tenant.plan === "enterprise" && "$149/month"}
              </div>
            </div>
            {tenant.plan !== "free" && <Button variant="outline">Manage Subscription</Button>}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Usage</CardTitle>
          <CardDescription>Current usage for this billing period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Patients</span>
            <span className="font-medium">42 / {tenant.plan === "free" ? "50" : "Unlimited"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Storage</span>
            <span className="font-medium">
              2.1 GB / {tenant.plan === "free" ? "1 GB" : tenant.plan === "pro" ? "50 GB" : "Unlimited"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Staff Members</span>
            <span className="font-medium">3 / {tenant.plan === "free" ? "3" : "Unlimited"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.popular ? "border-primary" : ""}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                <Star className="mr-1 h-3 w-3" />
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {plan.name}
                {plan.current && <Badge variant="secondary">Current</Badge>}
              </CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.limitations && (
                  <>
                    <Separator className="my-4" />
                    {plan.limitations.map((limitation, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full border border-muted-foreground/50" />
                        <span className="text-sm text-muted-foreground">{limitation}</span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={plan.current ? "outline" : "default"}
                disabled={plan.current || isLoading}
                onClick={() => handleUpgrade(plan.name.toLowerCase())}
              >
                {plan.current ? "Current Plan" : `Upgrade to ${plan.name}`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your recent billing and payment history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscription?.invoices?.length > 0 ? (
              subscription.invoices.map((invoice: any) => (
                <div key={invoice.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{invoice.description}</div>
                    <div className="text-sm text-muted-foreground">{invoice.date}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{invoice.amount}</span>
                    <Badge variant={invoice.status === "paid" ? "default" : "destructive"}>{invoice.status}</Badge>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground">No billing history available</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
