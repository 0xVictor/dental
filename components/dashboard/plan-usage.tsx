"use client"

import type React from "react"
import Link from "next/link"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PlanUsageProps extends React.HTMLAttributes<HTMLDivElement> {
  usage: {
    patients: { used: number; limit: number; percentage: number }
    storage: { used: number; limit: number; unit: string; percentage: number }
    staff: { used: number; limit: number; percentage: number }
  }
  plan: string
}

export function PlanUsage({ usage, plan, className, ...props }: PlanUsageProps) {
  const formatLimit = (limit: number, unit?: string) => {
    if (limit === Number.POSITIVE_INFINITY) return "Unlimited"
    return `${limit}${unit || ""}`
  }

  const formatUsed = (used: number, unit?: string) => {
    if (unit === "GB") {
      return used.toFixed(1)
    }
    return used.toString()
  }

  const usageData = [
    {
      name: "Patients",
      used: usage.patients.used,
      limit: usage.patients.limit,
      percentage: usage.patients.percentage,
    },
    {
      name: "Storage",
      used: usage.storage.used,
      limit: usage.storage.limit,
      unit: usage.storage.unit,
      percentage: usage.storage.percentage,
    },
    {
      name: "Staff Members",
      used: usage.staff.used,
      limit: usage.staff.limit,
      percentage: usage.staff.percentage,
    },
  ]

  return (
    <Card className={className} {...props}>
      <CardHeader>
        <CardTitle>Plan Usage</CardTitle>
        <CardDescription>
          You are currently on the <strong className="capitalize">{plan} Plan</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {usageData.map((item, index) => (
          <div key={index} className="grid gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{item.name}</div>
              <div className="text-sm text-muted-foreground">
                {formatUsed(item.used, item.unit)}
                {item.unit || ""} / {formatLimit(item.limit, item.unit)}
              </div>
            </div>
            {item.limit !== Number.POSITIVE_INFINITY && (
              <Progress
                value={item.percentage}
                className={`h-2 ${item.percentage >= 90 ? "bg-red-100" : item.percentage >= 75 ? "bg-yellow-100" : ""}`}
              />
            )}
          </div>
        ))}
      </CardContent>
      {plan === "free" && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/billing">Upgrade Plan</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
