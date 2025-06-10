"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createMedicalRecordAction } from "@/app/actions/medical-records"

const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentId: z.string().optional(),
  recordType: z.enum(["examination", "treatment", "consultation", "follow_up"]),
  title: z.string().min(2, "Title must be at least 2 characters"),
  diagnosis: z.string().min(5, "Diagnosis must be at least 5 characters"),
  treatment: z.string().min(5, "Treatment must be at least 5 characters"),
  medications: z.string().optional(),
  notes: z.string().optional(),
})

interface CreateMedicalRecordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: any
  preselectedPatientId?: string
  patients?: Array<{ id: string; name: string }>
  onRecordCreated?: () => void
}

export function CreateMedicalRecordDialog({
  open,
  onOpenChange,
  tenant,
  preselectedPatientId,
  patients,
  onRecordCreated,
}: CreateMedicalRecordDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [availablePatients, setAvailablePatients] = useState<Array<{ id: string; name: string }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: preselectedPatientId || "",
      appointmentId: "",
      recordType: "examination",
      title: "",
      diagnosis: "",
      treatment: "",
      medications: "",
      notes: "",
    },
  })

  // Update form when preselectedPatientId changes
  useEffect(() => {
    if (preselectedPatientId) {
      form.setValue("patientId", preselectedPatientId)
    }
  }, [preselectedPatientId, form])

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      form.reset({
        patientId: preselectedPatientId || "",
        appointmentId: "",
        recordType: "examination",
        title: "",
        diagnosis: "",
        treatment: "",
        medications: "",
        notes: "",
      })
    }
  }, [open, preselectedPatientId, form])

  // Set available patients
  useEffect(() => {
    if (patients) {
      setAvailablePatients(patients)
    } else if (preselectedPatientId) {
      // If we have a preselected patient but no patients list, create a minimal list with just this patient
      setAvailablePatients([{ id: preselectedPatientId, name: "Selected Patient" }])
    } else {
      // Fetch patients if needed
      const fetchPatients = async () => {
        try {
          const response = await fetch("/api/patients")
          const data = await response.json()
          if (data.success) {
            setAvailablePatients(data.patients)
          }
        } catch (error) {
          console.error("Error fetching patients:", error)
          setAvailablePatients([])
        }
      }

      fetchPatients()
    }
  }, [patients, preselectedPatientId])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("patientId", values.patientId)
      if (values.appointmentId) formData.append("appointmentId", values.appointmentId)
      formData.append("recordType", values.recordType)
      formData.append("title", values.title)
      formData.append("diagnosis", values.diagnosis)
      formData.append("treatment", values.treatment)
      formData.append("medications", values.medications || "")
      formData.append("notes", values.notes || "")

      const result = await createMedicalRecordAction(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Medical record created",
        description: "The medical record has been created successfully.",
      })

      form.reset()
      onOpenChange(false)
      onRecordCreated?.()
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Medical Record</DialogTitle>
          <DialogDescription>
            Add a new medical record for a patient. Fill in all the required information.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {!preselectedPatientId && (
                <FormField
                  control={form.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a patient" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availablePatients.map((patient) => (
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
              )}
              <FormField
                control={form.control}
                name="recordType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="examination">Examination</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                        <SelectItem value="follow_up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Annual Check-up 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="diagnosis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Diagnosis</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the diagnosis..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="treatment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Treatment</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter the treatment plan..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="medications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Medications (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List any prescribed medications..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional notes..." {...field} />
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
                {isLoading ? "Creating..." : "Create Record"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
