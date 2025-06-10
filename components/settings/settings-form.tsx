"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { updateTenantSettingsAction } from "@/app/actions/tenant"
import { InvitationManagement } from "./invitation-management"

const formSchema = z.object({
  clinicName: z.string().min(2, {
    message: "Clinic name must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
  phone: z.string().min(8, {
    message: "Phone number must be at least 8 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  emailNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  appointmentReminders: z.boolean(),
  rooms: z.array(z.string()),
  appointmentTypes: z.array(z.string()),
})

interface SettingsFormProps {
  tenant: any
  invitations: any[]
  members: any[]
}

export function SettingsForm({ tenant, invitations, members }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newRoom, setNewRoom] = useState("")
  const [newAppointmentType, setNewAppointmentType] = useState("")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clinicName: tenant.name || "",
      address: tenant.address || "",
      phone: tenant.phone || "",
      email: tenant.email || "",
      website: tenant.website || "",
      description: tenant.description || "",
      emailNotifications: tenant.emailNotifications ?? true,
      smsNotifications: tenant.smsNotifications ?? false,
      appointmentReminders: tenant.appointmentReminders ?? true,
      rooms: tenant.rooms || ["Room 1", "Room 2", "Room 3", "Room 4", "Surgery 1", "Surgery 2"],
      appointmentTypes: tenant.appointment_types || [
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
      ],
    },
  })

  const addRoom = () => {
    if (newRoom.trim()) {
      const currentRooms = form.getValues("rooms")
      if (!currentRooms.includes(newRoom.trim())) {
        form.setValue("rooms", [...currentRooms, newRoom.trim()])
        setNewRoom("")
      }
    }
  }

  const removeRoom = (roomToRemove: string) => {
    const currentRooms = form.getValues("rooms")
    form.setValue(
      "rooms",
      currentRooms.filter((room) => room !== roomToRemove),
    )
  }

  const addAppointmentType = () => {
    if (newAppointmentType.trim()) {
      const currentTypes = form.getValues("appointmentTypes")
      if (!currentTypes.includes(newAppointmentType.trim())) {
        form.setValue("appointmentTypes", [...currentTypes, newAppointmentType.trim()])
        setNewAppointmentType("")
      }
    }
  }

  const removeAppointmentType = (typeToRemove: string) => {
    const currentTypes = form.getValues("appointmentTypes")
    form.setValue(
      "appointmentTypes",
      currentTypes.filter((type) => type !== typeToRemove),
    )
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("tenantId", tenant.id)
      formData.append("clinicName", values.clinicName)
      formData.append("address", values.address)
      formData.append("phone", values.phone)
      formData.append("email", values.email)
      formData.append("website", values.website || "")
      formData.append("description", values.description || "")
      formData.append("emailNotifications", values.emailNotifications.toString())
      formData.append("smsNotifications", values.smsNotifications.toString())
      formData.append("appointmentReminders", values.appointmentReminders.toString())
      formData.append("rooms", JSON.stringify(values.rooms))
      formData.append("appointmentTypes", JSON.stringify(values.appointmentTypes))

      const result = await updateTenantSettingsAction(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Settings updated",
        description: "Your clinic settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Team Management */}
      <InvitationManagement invitations={invitations} members={members} />

      {/* Clinic Settings */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Clinic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Clinic Information</CardTitle>
              <CardDescription>Update your clinic's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Smile Dental Clinic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Main St, City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 234 567 8900" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@clinic.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.clinic.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Brief description of your clinic and services" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Rooms Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Rooms Configuration</CardTitle>
              <CardDescription>Manage your clinic rooms and treatment areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="rooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rooms</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new room"
                          value={newRoom}
                          onChange={(e) => setNewRoom(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addRoom())}
                        />
                        <Button type="button" onClick={addRoom} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((room) => (
                          <Badge key={room} variant="secondary" className="flex items-center gap-1">
                            {room}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeRoom(room)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Appointment Types Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Types</CardTitle>
              <CardDescription>Configure the types of appointments your clinic offers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="appointmentTypes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointment Types</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add new appointment type"
                          value={newAppointmentType}
                          onChange={(e) => setNewAppointmentType(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAppointmentType())}
                        />
                        <Button type="button" onClick={addAppointmentType} size="icon">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((type) => (
                          <Badge key={type} variant="secondary" className="flex items-center gap-1">
                            {type}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-muted-foreground hover:text-destructive"
                              onClick={() => removeAppointmentType(type)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="emailNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>Receive notifications via email</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="smsNotifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">SMS Notifications</FormLabel>
                      <FormDescription>Receive notifications via SMS</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={tenant.plan === "free"}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="appointmentReminders"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Appointment Reminders</FormLabel>
                      <FormDescription>Send automatic reminders to patients</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
