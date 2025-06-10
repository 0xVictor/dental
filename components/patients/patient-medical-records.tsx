"use client"

import { useState, useEffect } from "react"
import { FileText, Plus, MoreHorizontal, Stethoscope, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { CreateMedicalRecordDialog } from "../medical-records/create-medical-record-dialog"
import { toast } from "@/components/ui/use-toast"

interface PatientMedicalRecordsProps {
  records: any[]
  patientId: string
}

export function PatientMedicalRecords({ records: initialRecords, patientId }: PatientMedicalRecordsProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [records, setRecords] = useState(initialRecords || [])
  const [isLoading, setIsLoading] = useState(false)

  // Refresh records when initialRecords changes
  useEffect(() => {
    setRecords(initialRecords || [])
  }, [initialRecords])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "examination":
        return "bg-purple-100 text-purple-800"
      case "treatment":
        return "bg-green-100 text-green-800"
      case "consultation":
        return "bg-blue-100 text-blue-800"
      case "follow_up":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "active":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRecordCreated = () => {
    // Refresh records after a new one is created
    setIsLoading(true)

    // In a real app, we would fetch the updated records
    // For now, we'll just reload the page
    window.location.reload()
  }

  const viewRecordDetails = (recordId: string) => {
    toast({
      title: "View Record",
      description: `Viewing record ${recordId}`,
    })
    // In a real app, this would open a dialog with record details
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Medical Records
            </CardTitle>
            <CardDescription>
              {records.length === 0
                ? "No medical records"
                : `${records.length} medical record${records.length === 1 ? "" : "s"}`}
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Record
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No medical records</p>
              <p className="text-sm">Create the first medical record for this patient</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Diagnosis</TableHead>
                    <TableHead className="hidden lg:table-cell">Treatment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.created_at)}</TableCell>
                      <TableCell>
                        <Badge className={getRecordTypeColor(record.record_type)}>
                          {record.record_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                        {record.diagnosis || "N/A"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell max-w-[200px] truncate">
                        {record.treatment || "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status || "active")}>{record.status || "active"}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewRecordDetails(record.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>Edit Record</DropdownMenuItem>
                            <DropdownMenuItem>Print Record</DropdownMenuItem>
                            <DropdownMenuItem>Add Follow-up</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateMedicalRecordDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        tenant={{ id: "tenant-id" }}
        preselectedPatientId={patientId}
        onRecordCreated={handleRecordCreated}
      />
    </div>
  )
}
