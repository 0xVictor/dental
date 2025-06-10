"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { createAppointmentAction } from "@/app/actions/appointments"

const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentDate: z.date({
    required_error: "Appointment date is required",
  }),
  appointmentTime: z.string().min(1, "Please select a time"),
  duration: z.number().min(15, "Duration must be at least 15 minutes"),
  type: z.string().optional(), // Made optional
  room: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "confirmed", "cancelled"]),
})

interface CreateAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patients: Array<{ id: string; name: string }>
  selectedPatientId?: string | null
  onAppointmentCreated?: () => void
  tenant?: any
}

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  patients,
  selectedPatientId,
  onAppointmentCreated,
  tenant,
}: CreateAppointmentDialogProps) {
  console.log("📅 [APPOINTMENT_DIALOG] Component initialized")
  console.log("📅 [APPOINTMENT_DIALOG] Open:", open)
  console.log("📅 [APPOINTMENT_DIALOG] Available patients:", patients?.length || 0)
  console.log("📅 [APPOINTMENT_DIALOG] Selected patient:", selectedPatientId)

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: selectedPatientId || "",
      appointmentTime: "",
      duration: 30,
      type: "",
      room: "",
      notes: "",
      status: "scheduled",
    },
  })

  // Update form when selectedPatientId changes
  useEffect(() => {
    if (selectedPatientId) {
      console.log("📅 [APPOINTMENT_DIALOG] Setting selected patient:", selectedPatientId)
      form.setValue("patientId", selectedPatientId)
    }
  }, [selectedPatientId, form])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      console.log("📅 [APPOINTMENT_DIALOG] Dialog opened - resetting form")
      form.reset({
        patientId: selectedPatientId || "",
        appointmentTime: "",
        duration: 30,
        type: "",
        room: "",
        notes: "",
        status: "scheduled",
      })
    }
  }, [open, selectedPatientId, form])

  // Get appointment types from tenant settings or use defaults
  const appointmentTypes = tenant?.appointment_types || [
    "Check-up",
    "Cleaning",
    "Consultation",
    "Root Canal",
    "Filling",
    "Extraction",
    "Crown",
    "Bridge",
    "Implant",
    "Orthodontics",
    "Emergency",
    "Follow-up",
  ]

  // Get rooms from tenant settings or use defaults
  const rooms = tenant?.rooms || ["Room 1", "Room 2", "Room 3", "Room 4", "Surgery 1", "Surgery 2"]

  const timeSlots = Array.from({ length: 20 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8 // Start from 8 AM
    const minute = (i % 2) * 30 // 0 or 30 minutes
    const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    const displayTime = new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    return { value: time, label: displayTime }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("📅 [APPOINTMENT_SUBMIT] Starting appointment submission")
    console.log("📅 [APPOINTMENT_SUBMIT] Form values:", values)

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("patientId", values.patientId)
      formData.append("appointmentDate", values.appointmentDate.toISOString().split("T")[0])
      formData.append("appointmentTime", values.appointmentTime)
      formData.append("duration", values.duration.toString())
      formData.append("type", values.type || "General") // Default type if not provided
      formData.append("room", values.room || "")
      formData.append("notes", values.notes || "")
      formData.append("status", values.status)

      console.log("📅 [APPOINTMENT_SUBMIT] FormData prepared:")
      for (const [key, value] of formData.entries()) {
        console.log(`  ${key}: ${value}`)
      }

      console.log("🚀 [APPOINTMENT_SUBMIT] Calling createAppointmentAction...")
      const result = await createAppointmentAction(formData)

      console.log("📥 [APPOINTMENT_SUBMIT] Result received:", result)

      if (result.error) {
        console.error("❌ [APPOINTMENT_SUBMIT] Error returned:", result.error)
        throw new Error(result.error)
      }

      console.log("✅ [APPOINTMENT_SUBMIT] Appointment created successfully!")

      toast({
        title: "Appointment created",
        description: "The appointment has been scheduled successfully.",
      })

      form.reset()
      onOpenChange(false)
      onAppointmentCreated?.()
    } catch (error: any) {
      console.error("💥 [APPOINTMENT_SUBMIT] Error during submission:", error)
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check if we have patients available
  if (patients.length === 0) {
    console.warn("⚠️ [APPOINTMENT_DIALOG] No patients available")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new appointment for a patient. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>

        {patients.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No patients available. You need to add at least one patient before scheduling an appointment.
            </p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        console.log("📅 [APPOINTMENT_DIALOG] Patient selected:", value)
                        field.onChange(value)
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={(date) => {
                              console.log("📅 [APPOINTMENT_DIALOG] Date selected:", date)
                              field.onChange(date)
                            }}
                            disabled={(date) => {
                              // Allow today and future dates
                              const today = new Date()
                              today.setHours(0, 0, 0, 0)
                              return date < today
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("📅 [APPOINTMENT_DIALOG] Time selected:", value)
                          field.onChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {timeSlots.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              {slot.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Type</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("📅 [APPOINTMENT_DIALOG] Type selected:", value)
                          field.onChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {appointmentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes) *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("📅 [APPOINTMENT_DIALOG] Duration selected:", value)
                          field.onChange(Number(value))
                        }}
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">1 hour</SelectItem>
                          <SelectItem value="90">1.5 hours</SelectItem>
                          <SelectItem value="120">2 hours</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="room"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("📅 [APPOINTMENT_DIALOG] Room selected:", value)
                          field.onChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select room" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {rooms.map((room) => (
                            <SelectItem key={room} value={room}>
                              {room}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          console.log("📅 [APPOINTMENT_DIALOG] Status selected:", value)
                          field.onChange(value)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any additional notes for this appointment..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Scheduling..." : "Schedule Appointment"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
