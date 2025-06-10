"use client"

import { useState } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, MoreHorizontal, Plus, User, Clock, MapPin } from "lucide-react"
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CreateAppointmentDialog } from "../appointments/create-appointment-dialog"

interface CalendarProps {
  appointments: any[]
  tenant: any
  patients: any[]
}

export function Calendar({ appointments, tenant, patients }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"week" | "day">("week")
  const [isCreateAppointmentOpen, setIsCreateAppointmentOpen] = useState(false)

  console.log("📅 [CALENDAR] Appointments received:", appointments?.length || 0)
  console.log("📅 [CALENDAR] Patients received:", patients?.length || 0)
  console.log("📅 [CALENDAR] Appointments data:", appointments)

  const weekStart = startOfWeek(currentDate)
  const weekEnd = endOfWeek(currentDate)
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Create time slots every 30 minutes from 8 AM to 6 PM
  const timeSlots = []
  for (let hour = 8; hour < 18; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`)
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`)
  }

  const getAppointmentsForDay = (date: Date) => {
    const dayAppointments = appointments.filter((appointment) => {
      try {
        const appointmentDate = parseISO(appointment.appointment_date)
        const matches = isSameDay(appointmentDate, date)
        if (matches) {
          console.log(`📅 [CALENDAR] Found appointment for ${format(date, "yyyy-MM-dd")}:`, appointment)
        }
        return matches
      } catch (error) {
        console.error("Error parsing appointment date:", error, appointment)
        return false
      }
    })

    console.log(`📅 [CALENDAR] Appointments for ${format(date, "yyyy-MM-dd")}:`, dayAppointments.length)
    return dayAppointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
  }

  const getAppointmentsInTimeSlot = (date: Date, timeSlot: string) => {
    const [slotHour, slotMinute] = timeSlot.split(":").map(Number)

    return appointments.filter((appointment) => {
      try {
        const appointmentDate = parseISO(appointment.appointment_date)
        if (!isSameDay(appointmentDate, date)) return false

        const [appointmentHour, appointmentMinute] = appointment.appointment_time.split(":").map(Number)

        // Check if appointment falls within this 30-minute slot
        const appointmentTotalMinutes = appointmentHour * 60 + appointmentMinute
        const slotStartMinutes = slotHour * 60 + slotMinute
        const slotEndMinutes = slotStartMinutes + 30

        const isInSlot = appointmentTotalMinutes >= slotStartMinutes && appointmentTotalMinutes < slotEndMinutes

        if (isInSlot) {
          console.log(`📅 [CALENDAR] Appointment ${appointment.id} fits in slot ${timeSlot}:`, appointment)
        }

        return isInSlot
      } catch (error) {
        console.error("Error checking appointment time slot:", error, appointment)
        return false
      }
    })
  }

  const handleAppointmentCreated = () => {
    console.log("✅ [CALENDAR] Appointment created - reloading page")
    window.location.reload()
  }

  const handleNewAppointmentClick = () => {
    console.log("📅 [CALENDAR] New Appointment button clicked")
    if (patients.length === 0) {
      alert("You need to add at least one patient before scheduling an appointment.")
      return
    }
    setIsCreateAppointmentOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
      case "cancelled":
        return "bg-red-50 border-red-200 text-red-800 hover:bg-red-100"
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100"
      case "scheduled":
      default:
        return "bg-indigo-50 border-indigo-200 text-indigo-800 hover:bg-indigo-100"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      case "completed":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "scheduled":
      default:
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
    }
  }

  return (
    <TooltipProvider>
      <div className="mt-6 space-y-6">
        {/* Header Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-3">
            <Select value={view} onValueChange={(value: "week" | "day") => setView(value)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Week View</SelectItem>
                <SelectItem value="day">Day View</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-2 shadow-sm" onClick={handleNewAppointmentClick}>
              <Plus className="h-4 w-4" />
              <span>New Appointment</span>
            </Button>
          </div>
        </div>

        {/* Schedule Grid */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="grid grid-cols-8 min-w-[900px] border-t">
                {/* Time column */}
                <div className="border-r bg-gray-50/50">
                  <div className="h-16 flex items-center justify-center text-sm font-medium text-gray-600 border-b bg-gray-100/50">
                    Time
                  </div>
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className={`h-16 flex items-center justify-center text-sm text-gray-600 border-b ${
                        index % 2 === 0 ? "bg-gray-50/30" : "bg-white"
                      }`}
                    >
                      <div className="text-center">
                        <div className="font-medium">{time}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIndex) => (
                  <div key={day.toISOString()} className="border-r last:border-r-0">
                    {/* Day header */}
                    <div className="h-16 flex flex-col items-center justify-center border-b bg-gray-50/50">
                      <div className="text-sm font-medium text-gray-600">{format(day, "EEE")}</div>
                      <div
                        className={`text-lg font-semibold ${
                          isSameDay(day, new Date())
                            ? "text-primary bg-primary/10 rounded-full w-8 h-8 flex items-center justify-center"
                            : "text-gray-900"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div>
                      {timeSlots.map((timeSlot, slotIndex) => {
                        const appointmentsInSlot = getAppointmentsInTimeSlot(day, timeSlot)
                        return (
                          <div
                            key={timeSlot}
                            className={`h-16 border-b relative ${
                              slotIndex % 2 === 0 ? "bg-gray-50/20" : "bg-white"
                            } hover:bg-blue-50/30 transition-colors`}
                          >
                            {appointmentsInSlot.map((appointment, index) => (
                              <Tooltip key={appointment.id}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`absolute inset-1 rounded-lg border-2 p-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(
                                      appointment.status,
                                    )}`}
                                    style={{
                                      top: `${4 + index * 2}px`,
                                      left: `${4 + index * 2}px`,
                                      right: `${4 + index * 2}px`,
                                      bottom: `${4 + index * 2}px`,
                                      zIndex: 10 - index,
                                    }}
                                  >
                                    <div className="flex flex-col h-full justify-between">
                                      <div>
                                        <div className="text-xs font-semibold truncate leading-tight">
                                          {appointment.patients?.name || "Unknown Patient"}
                                        </div>
                                        <div className="text-xs opacity-80 truncate">
                                          {appointment.type || "General"}
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between">
                                        <div className="text-xs font-medium">{appointment.appointment_time}</div>
                                        <Badge
                                          variant="secondary"
                                          className={`text-xs px-1 py-0 ${getStatusBadgeColor(appointment.status)}`}
                                        >
                                          {appointment.status.charAt(0).toUpperCase()}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <div className="font-semibold">{appointment.patients?.name}</div>
                                    <div className="text-sm">
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {appointment.appointment_time} ({appointment.duration} min)
                                      </div>
                                      <div className="flex items-center gap-1 mt-1">
                                        <MapPin className="h-3 w-3" />
                                        {appointment.room || "No room assigned"}
                                      </div>
                                    </div>
                                    <Badge className={getStatusBadgeColor(appointment.status)}>
                                      {appointment.status}
                                    </Badge>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Today's Appointments
              <Badge variant="secondary" className="ml-2">
                {getAppointmentsForDay(new Date()).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getAppointmentsForDay(new Date()).length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No appointments scheduled for today</p>
                  <p className="text-sm">Your schedule is clear!</p>
                </div>
              ) : (
                getAppointmentsForDay(new Date()).map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between rounded-xl border p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold text-lg">{appointment.patients?.name || "Unknown Patient"}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {appointment.appointment_time}
                          </span>
                          <span>•</span>
                          <span>{appointment.type || "General"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {appointment.room || "No room"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{appointment.duration} minutes</div>
                      </div>
                      <Badge className={getStatusBadgeColor(appointment.status)}>{appointment.status}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Reschedule</DropdownMenuItem>
                          <DropdownMenuItem>Cancel</DropdownMenuItem>
                          <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <CreateAppointmentDialog
          open={isCreateAppointmentOpen}
          onOpenChange={setIsCreateAppointmentOpen}
          patients={patients.map((p) => ({ id: p.id, name: p.name }))}
          onAppointmentCreated={handleAppointmentCreated}
          tenant={tenant}
        />
      </div>
    </TooltipProvider>
  )
}
