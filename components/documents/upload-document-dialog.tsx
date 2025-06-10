"use client"

import { useState, useEffect, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Upload, X, File } from "lucide-react"

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
import { toast } from "@/components/ui/use-toast"
import { uploadDocumentAction } from "@/app/actions/documents"

const formSchema = z.object({
  patientId: z.string().min(1, "Please select a patient"),
  appointmentId: z.string().optional(),
  documentType: z.enum(["x-ray", "treatment_plan", "consent_form", "insurance", "photo", "other"]),
  description: z.string().min(5, "Description must be at least 5 characters"),
})

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tenant: any
  preselectedPatientId?: string
  patients?: Array<{ id: string; name: string }>
  onDocumentUploaded?: () => void
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  tenant,
  preselectedPatientId,
  patients,
  onDocumentUploaded,
}: UploadDocumentDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [availablePatients, setAvailablePatients] = useState<Array<{ id: string; name: string }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: preselectedPatientId || "",
      appointmentId: "",
      documentType: "other",
      description: "",
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
        documentType: "other",
        description: "",
      })
      setUploadedFiles([])
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files selected",
        description: "Please select at least one file to upload.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // We'll handle one file at a time for simplicity
      const file = uploadedFiles[0]

      const formData = new FormData()
      formData.append("patientId", values.patientId)
      if (values.appointmentId) formData.append("appointmentId", values.appointmentId)
      formData.append("documentType", values.documentType)
      formData.append("description", values.description)
      formData.append("file", file)

      const result = await uploadDocumentAction(formData)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Document uploaded",
        description: `${uploadedFiles.length} document(s) uploaded successfully.`,
      })

      form.reset()
      setUploadedFiles([])
      onOpenChange(false)
      onDocumentUploaded?.()
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>Upload patient documents, X-rays, treatment plans, and other files.</DialogDescription>
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
                name="documentType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Document Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="x-ray">X-ray</SelectItem>
                        <SelectItem value="treatment_plan">Treatment Plan</SelectItem>
                        <SelectItem value="consent_form">Consent Form</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the document..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload Area */}
            <div className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p>Drop the files here...</p>
                ) : (
                  <div>
                    <p className="text-lg font-medium">Drag & drop files here</p>
                    <p className="text-sm text-muted-foreground">or click to select files</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Supports: Images, PDF, DOC, DOCX (max 10MB each)
                    </p>
                  </div>
                )}
              </div>

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Selected Files:</h4>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">({formatFileSize(file.size)})</span>
                      </div>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading || uploadedFiles.length === 0}>
                {isLoading ? "Uploading..." : `Upload ${uploadedFiles.length} File(s)`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
