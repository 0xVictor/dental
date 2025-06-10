"use client"

import { useState, useEffect } from "react"
import { FileText, ImageIcon, File } from "lucide-react"

interface PatientDocumentsProps {
  documents: any[]
  patientId: string
}

export function PatientDocuments({ documents: initialDocuments, patientId }: PatientDocumentsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [documents, setDocuments] = useState(initialDocuments || [])
  const [isLoading, setIsLoading] = useState(false)

  // Refresh documents when initialDocuments changes
  useEffect(() => {
    setDocuments(initialDocuments || [])
  }, [initialDocuments])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) {
      return <ImageIcon className="h-4 w-4 text-blue-500" />
    } else if (fileType === "application/pdf") {
      return <FileText className="h-4 w-4 text-red-500" />
    } else {
      return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const getDocumentTypeColor = (type: string) => {
    switch (type) {
      case "x-ray":
        return "bg-blue-100 text-blue-800"
      case "treatment_plan":
        return "bg-green-100 text-green-800"
      case "consent_form":
        return "bg-purple-100 text-purple-800"
      case "insurance":
        return "bg-orange-100 text-orange-800"
      case "photo":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleDocumentUploaded = () => {
    // Refresh documents after a new one is uploaded
    setIsLoading(true)

// In a real app, we would fetch the update
