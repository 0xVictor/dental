"use client"

import { useState } from "react"
import { ArrowLeft, Phone, Mail, MapPin, Edit, Plus } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PatientOverview } from "./patient-overview"
import { PatientAppointments } from "./patient-appointments"
import { PatientMedicalRecords } from "./patient-medical-records"
import { PatientPayments } from "./patient-payments"
import { PatientDocuments } from "./patient-documents"
import { Odontogram } from "./odontogram"
import { CreateAppointmentDialog } from "../appointments/create-appointment-dialog"

interface PatientProfileProps {
  patient: any
  tenant: any
}

export function PatientProfile({ patient, tenant }: PatientProfileProps) {
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false)

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

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/patients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Patient Profile</h1>
          <p className="text-muted-foreground">Comprehensive patient clinical record</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
          <Button size="sm" onClick={() => setIsCreateAppointmentOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </div>
      </div>

      {/* Patient Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/placeholder.svg" alt={patient.name} />
              <AvatarFallback className="text-lg">
                {patient.name
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{patient.name}</h2>
                  <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                </div>
                <p className="text-muted-foreground">
                  {getAge(patient.date_of_birth)} years old • {patient.gender} • Patient since{" "}
                  {formatDate(patient.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                {patient.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.email}</span>
                  </div>
                )}
                {patient.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{patient.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="records">Medical Records</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="odontogram">Odontogram</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PatientOverview patient={patient} />
        </TabsContent>

        <TabsContent value="appointments">
          <PatientAppointments appointments={patient.appointments} patientId={patient.id} />
        </TabsContent>

        <TabsContent value="records">
          <PatientMedicalRecords records={patient.medicalRecords} patientId={patient.id} />
        </TabsContent>

        <TabsContent value="payments">
          <PatientPayments transactions={patient.transactions} patientId={patient.id} />
        </TabsContent>

        <TabsContent value="documents">
          <PatientDocuments documents={patient.documents} patientId={patient.id} />
        </TabsContent>

        <TabsContent value="odontogram">
          <Odontogram patientId={patient.id} />
        </TabsContent>
      </Tabs>

      <CreateAppointmentDialog
        open={isCreateAppointmentOpen}
        onOpenChange={setIsCreateAppointmentOpen}
        patients={[{ id: patient.id, name: patient.name }]}
        onAppointmentCreated={() => window.location.reload()}
      />
    </div>
  )
}
