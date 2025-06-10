"use client"

import { Heart, AlertTriangle, Shield, Calendar, Phone, User } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface PatientOverviewProps {
  patient: any
}

export function PatientOverview({ patient }: PatientOverviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const upcomingAppointments = patient.appointments?.filter(
    (apt: any) => new Date(apt.appointment_date) >= new Date() && ["scheduled", "confirmed"].includes(apt.status),
  )

  const completedAppointments = patient.appointments?.filter((apt: any) => apt.status === "completed")

  const totalSpent = patient.transactions
    ?.filter((t: any) => t.transaction_type === "payment" && t.status === "completed")
    .reduce((sum: number, t: any) => sum + Number.parseFloat(t.amount), 0)

  const outstandingBalance = patient.transactions
    ?.filter((t: any) => t.transaction_type === "payment" && t.status === "pending")
    .reduce((sum: number, t: any) => sum + Number.parseFloat(t.amount), 0)

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p className="text-sm">{formatDate(patient.date_of_birth)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p className="text-sm">{getAge(patient.date_of_birth)} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gender</p>
              <p className="text-sm capitalize">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
            </div>
          </div>
          {patient.address && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="text-sm">{patient.address}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {patient.emergency_contact_name && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-sm">{patient.emergency_contact_name}</p>
              </div>
            )}
            {patient.emergency_contact_phone && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="text-sm">{patient.emergency_contact_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Health Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patient.medical_history && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Medical History</p>
              <p className="text-sm">{patient.medical_history}</p>
            </div>
          )}
          {patient.allergies && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Allergies
                </p>
                <p className="text-sm text-orange-700">{patient.allergies}</p>
              </div>
            </>
          )}
          {patient.insurance && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Insurance
                </p>
                <p className="text-sm">{patient.insurance}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Visits</p>
              <p className="text-2xl font-bold">{completedAppointments?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-bold">{upcomingAppointments?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">${totalSpent?.toFixed(2) || "0.00"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">${outstandingBalance?.toFixed(2) || "0.00"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
