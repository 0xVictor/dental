"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, MoreHorizontal, Plus, Search, SlidersHorizontal, Eye, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { checkPlanLimit } from "@/lib/subscription"
import { CreatePatientDialog } from "./create-patient-dialog"
import { CreateAppointmentDialog } from "../appointments/create-appointment-dialog"

interface PatientsListProps {
  patients: any[]
  tenant: any
}

export function PatientsList({ patients: initialPatients, tenant }: PatientsListProps) {
  console.log("🏥 [PATIENTS_LIST] Componente inicializado")
  console.log("🏥 [PATIENTS_LIST] Pacientes iniciais:", initialPatients?.length || 0)
  console.log("🏥 [PATIENTS_LIST] Tenant:", tenant)

  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatePatientOpen, setIsCreatePatientOpen] = useState(false)
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false)
  const [patients, setPatients] = useState(initialPatients || [])
  const [selectedPatientForAppointment, setSelectedPatientForAppointment] = useState<string | null>(null)

  // Update patients when initialPatients changes
  useEffect(() => {
    console.log("🔄 [PATIENTS_LIST] useEffect - Atualizando lista de pacientes")
    console.log("🔄 [PATIENTS_LIST] Novos pacientes:", initialPatients?.length || 0)
    setPatients(initialPatients || [])
  }, [initialPatients])

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  console.log("🔍 [PATIENTS_LIST] Pacientes filtrados:", filteredPatients.length)

  const canAddPatient = checkPlanLimit({
    plan: tenant.plan,
    currentCount: patients.length,
    resourceName: "patients",
  })

  console.log("📊 [PATIENTS_LIST] Pode adicionar paciente:", canAddPatient)

  const handlePatientCreated = () => {
    console.log("✅ [PATIENTS_LIST] Paciente criado - recarregando página")
    // Force a page refresh to show the new patient
    window.location.reload()
  }

  const handleAppointmentCreated = () => {
    console.log("✅ [PATIENTS_LIST] Agendamento criado - recarregando página")
    // Force a page refresh to update appointment data
    window.location.reload()
  }

  const handleNewAppointmentClick = () => {
    console.log("📅 [PATIENTS_LIST] Botão 'New Appointment' clicado")
    console.log("📅 [PATIENTS_LIST] Pacientes disponíveis:", patients.length)

    if (patients.length === 0) {
      console.warn("⚠️ [PATIENTS_LIST] Nenhum paciente disponível para agendamento")
      alert("You need to add at least one patient before scheduling an appointment.")
      return
    }

    setIsCreateAppointmentOpen(true)
    console.log("📅 [PATIENTS_LIST] Dialog de agendamento aberto")
  }

  const handleScheduleAppointmentForPatient = (patientId: string, patientName: string) => {
    console.log("📅 [PATIENTS_LIST] Agendamento para paciente específico:", patientId, patientName)
    setSelectedPatientForAppointment(patientId)
    setIsCreateAppointmentOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      console.error("❌ [PATIENTS_LIST] Erro ao formatar data:", error)
      return "Invalid Date"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            className="h-8 w-[150px] lg:w-[250px]"
            value={searchQuery}
            onChange={(e) => {
              console.log("🔍 [PATIENTS_LIST] Busca alterada:", e.target.value)
              setSearchQuery(e.target.value)
            }}
          />
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Filter</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleNewAppointmentClick}>
            <Calendar className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">New Appointment</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Export</span>
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1"
            disabled={!canAddPatient}
            onClick={() => {
              console.log("👤 [PATIENTS_LIST] Botão 'Add Patient' clicado")
              setIsCreatePatientOpen(true)
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Patient</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
              <TableHead className="hidden lg:table-cell">Last Visit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPatients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No patients found matching your search."
                    : "No patients yet. Add your first patient to get started."}
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients.map((patient) => {
                console.log("👤 [PATIENTS_LIST] Renderizando paciente:", patient.id, patient.name)
                return (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="hidden md:table-cell">{patient.email || "N/A"}</TableCell>
                    <TableCell className="hidden md:table-cell">{patient.phone}</TableCell>
                    <TableCell className="hidden md:table-cell">{formatDate(patient.date_of_birth)}</TableCell>
                    <TableCell className="hidden lg:table-cell">{formatDate(patient.last_visit)}</TableCell>
                    <TableCell>
                      <div
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(patient.status || "active")}`}
                      >
                        {patient.status || "active"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/patients/${patient.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleScheduleAppointmentForPatient(patient.id, patient.name)}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            Schedule Appointment
                          </DropdownMenuItem>
                          <DropdownMenuItem>Medical Records</DropdownMenuItem>
                          <DropdownMenuItem>Treatment Plan</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {!canAddPatient && tenant.plan === "free" && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Patient limit reached</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>You've reached the limit of 50 patients on the Free plan.</p>
                <Button variant="link" className="p-0 text-primary" asChild>
                  <Link href="/dashboard/billing">Upgrade to Pro</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <CreatePatientDialog
        open={isCreatePatientOpen}
        onOpenChange={(open) => {
          console.log("👤 [PATIENTS_LIST] Dialog de criação de paciente:", open ? "aberto" : "fechado")
          setIsCreatePatientOpen(open)
        }}
        onPatientCreated={handlePatientCreated}
      />

      <CreateAppointmentDialog
        open={isCreateAppointmentOpen}
        onOpenChange={(open) => {
          console.log("📅 [PATIENTS_LIST] Dialog de agendamento:", open ? "aberto" : "fechado")
          setIsCreateAppointmentOpen(open)
          if (!open) {
            setSelectedPatientForAppointment(null)
          }
        }}
        patients={patients.map((p) => ({ id: p.id, name: p.name }))}
        selectedPatientId={selectedPatientForAppointment}
        onAppointmentCreated={handleAppointmentCreated}
      />
    </div>
  )
}
