"use client"

import { Activity, Calendar, DollarSign, Users } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OverviewProps {
  stats: {
    totalPatients: number
    upcomingAppointments: number
    totalRevenue: number
    activeTreatments: number
    revenueChange: number
    patientGrowth: number
    newPatientsThisMonth: number
  }
}

export function Overview({ stats }: OverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(1)}%`
  }

  const overviewStats = [
    {
      title: "Total Patients",
      value: stats.totalPatients.toString(),
      description: `+${stats.newPatientsThisMonth} this month`,
      icon: Users,
      color: "text-blue-500",
      trend: stats.patientGrowth,
    },
    {
      title: "Appointments",
      value: stats.upcomingAppointments.toString(),
      description: "Next 7 days",
      icon: Calendar,
      color: "text-green-500",
      trend: null,
    },
    {
      title: "Revenue",
      value: formatCurrency(stats.totalRevenue),
      description: `${formatPercentage(stats.revenueChange)} from last month`,
      icon: DollarSign,
      color: "text-yellow-500",
      trend: stats.revenueChange,
    },
    {
      title: "Active Treatments",
      value: stats.activeTreatments.toString(),
      description: "In progress",
      icon: Activity,
      color: "text-purple-500",
      trend: null,
    },
  ]

  return (
    <>
      {overviewStats.map((stat, index) => {
        const Icon = stat.icon
        const trendColor =
          stat.trend !== null ? (stat.trend >= 0 ? "text-green-600" : "text-red-600") : "text-muted-foreground"

        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${trendColor}`}>{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </>
  )
}
