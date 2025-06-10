"use client"

import { useState } from "react"
import { ImageIcon, FileText, File, MoreHorizontal, Search, Upload, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UploadDocumentDialog } from "./upload-document-dialog"

interface DocumentsListProps {
  documents: any[]
  tenant: any
}

export function DocumentsList({ documents: initialDocuments, tenant }: DocumentsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [documentType, setDocumentType] = useState("all")
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  // Sample documents data
  const documents =
    initialDocuments.length > 0
      ? initialDocuments
      : [
          {
            id: "DOC-1234",
            fileName: "john_smith_xray_2023.jpg",
            patientName: "John Smith",
            documentType: "x-ray",
            fileType: "image/jpeg",
            fileSize: "2.4 MB",
            uploadDate: "2023-06-01",
            description: "Panoramic X-ray for annual check-up",
          },
          {
            id: "DOC-1235",
            fileName: "sarah_johnson_treatment_plan.pdf",
            patientName: "Sarah Johnson",
            documentType: "treatment_plan",
            fileType: "application/pdf",
            fileSize: "1.2 MB",
            uploadDate: "2023-06-05",
            description: "Comprehensive treatment plan for cavity treatment",
          },
          {
            id: "DOC-1236",
            fileName: "michael_brown_consent_form.pdf",
            patientName: "Michael Brown",
            documentType: "consent_form",
            fileType: "application/pdf",
            fileSize: "0.8 MB",
            uploadDate: "2023-06-10",
            description: "Signed consent form for root canal procedure",
          },
          {
            id: "DOC-1237",
            fileName: "emily_davis_insurance_claim.pdf",
            patientName: "Emily Davis",
            documentType: "insurance",
            fileType: "application/pdf",
            fileSize: "0.5 MB",
            uploadDate: "2023-06-12",
            description: "Insurance claim documentation",
          },
          {
            id: "DOC-1238",
            fileName: "clinic_before_after.jpg",
            patientName: "David Wilson",
            documentType: "photo",
            fileType: "image/jpeg",
            fileSize: "3.1 MB",
            uploadDate: "2023-06-14",
            description: "Before and after treatment photos",
          },
        ]

  const filteredDocuments = documents.filter((document) => {
    const matchesSearch =
      document.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      document.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = documentType === "all" || document.documentType === documentType

    return matchesSearch && matchesType
  })

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

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="h-8 w-[150px] lg:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="x-ray">X-rays</SelectItem>
              <SelectItem value="treatment_plan">Treatment Plans</SelectItem>
              <SelectItem value="consent_form">Consent Forms</SelectItem>
              <SelectItem value="insurance">Insurance</SelectItem>
              <SelectItem value="photo">Photos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Export</span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </Button>
        </div>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>
            {tenant.plan === "free" ? "1 GB" : tenant.plan === "pro" ? "50 GB" : "Unlimited"} storage available
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Used Storage</span>
              <span className="text-sm text-muted-foreground">
                2.1 GB / {tenant.plan === "free" ? "1 GB" : tenant.plan === "pro" ? "50 GB" : "∞"}
              </span>
            </div>
            {tenant.plan !== "enterprise" && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: tenant.plan === "free" ? "100%" : "4.2%" }}
                ></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="hidden md:table-cell">Size</TableHead>
              <TableHead className="hidden md:table-cell">Upload Date</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.map((document) => (
              <TableRow key={document.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getFileIcon(document.fileType)}
                    <span className="font-medium truncate max-w-[200px]">{document.fileName}</span>
                  </div>
                </TableCell>
                <TableCell>{document.patientName}</TableCell>
                <TableCell>
                  <Badge className={getDocumentTypeColor(document.documentType)}>
                    {document.documentType.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{document.fileSize}</TableCell>
                <TableCell className="hidden md:table-cell">{document.uploadDate}</TableCell>
                <TableCell className="hidden lg:table-cell max-w-[200px] truncate">{document.description}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                      <DropdownMenuItem>Edit Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <UploadDocumentDialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen} tenant={tenant} />
    </div>
  )
}
