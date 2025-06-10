"use client"

import { CalendarDays, Phone, User } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TodaysAppointmentsProps {
  appointments: Array<{
    id: string
    patientName: string
    patientPhone: string
    time: string
    duration: number
    type: string
    status: string
    room: string
    notes?: string
  }>
}

export function TodaysAppointments({ appointments }: TodaysAppointmentsProps) {
  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Today's Appointments
        </CardTitle>
        <CardDescription>
          {appointments.length === 0
            ? "No appointments scheduled for today"
            : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"} scheduled`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No appointments today</p>
            <p className="text-sm">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between rounded-lg border p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">{appointment.patientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.type}
                      {appointment.room && ` • ${appointment.room}`}
                    </div>
                    {appointment.patientPhone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {appointment.patientPhone}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{formatTime(appointment.time)}</div>
                    <div className="text-sm text-muted-foreground">{appointment.duration} min</div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
