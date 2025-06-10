"use client"

import type React from "react"
import { CalendarDays, Clock, MapPin, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface UpcomingAppointmentsProps extends React.HTMLAttributes<HTMLDivElement> {
  appointments: Array<{
    id: string
    patientName: string
    date: string
    time: string
    duration: number
    type: string
    room: string
    status: string
  }>
}

export function UpcomingAppointments({ appointments, className, ...props }: UpcomingAppointmentsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={className} {...props}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Upcoming Appointments</CardTitle>
          <CardDescription>
            {appointments.length === 0
              ? "No upcoming appointments"
              : `You have ${appointments.length} appointment${appointments.length === 1 ? "" : "s"} scheduled`}
          </CardDescription>
        </div>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>No upcoming appointments</p>
            <p className="text-sm">Schedule your first appointment to get started</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="grid grid-cols-[1fr_auto] items-start gap-4 rounded-lg border p-4">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{appointment.patientName}</div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">{appointment.type}</div>
                <div className="mt-2 flex items-center text-xs text-muted-foreground">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  {formatDate(appointment.date)}
                  <Clock className="ml-3 mr-1 h-3 w-3" />
                  {formatTime(appointment.time)} ({appointment.duration} min)
                  {appointment.room && (
                    <>
                      <MapPin className="ml-3 mr-1 h-3 w-3" />
                      {appointment.room}
                    </>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  <DropdownMenuItem>Cancel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Appointments
        </Button>
      </CardFooter>
    </Card>
  )
}
