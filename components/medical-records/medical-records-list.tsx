"use client"

import { useState } from "react"
import { MoreHorizontal, Plus, Search, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateMedicalRecordDialog } from "./create-medical-record-dialog"

interface MedicalRecordsListProps {
  records: any[]
  tenant: any
}

export function MedicalRecordsList({ records: initialRecords, tenant }: MedicalRecordsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [recordType, setRecordType] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Sample medical records data
  const records =
    initialRecords.length > 0
      ? initialRecords
      : [
          {
            id: "REC-1234",
            patientName: "John Smith",
            recordType: "examination",
            title: "Annual Check-up 2023",
            diagnosis: "Good oral health, minor plaque buildup",
            treatment: "Professional cleaning recommended",
            date: "2023-06-01",
            status: "completed",
            doctor: "Dr. Jennifer Martinez",
          },
          {
            id: "REC-1235",
            patientName: "Sarah Johnson",
            recordType: "treatment",
            title: "Cavity Treatment",
            diagnosis: "Dental caries in tooth #14",
            treatment: "Composite filling placed",
            date: "2023-06-05",
            status: "completed",
            doctor: "Dr. Jennifer Martinez",
          },
          {
            id: "REC-1236",
            patientName: "Michael Brown",
            recordType: "consultation",
            title: "Root Canal Consultation",
            diagnosis: "Infected root canal in tooth #19",
            treatment: "Root canal therapy recommended",
            date: "2023-06-10",
            status: "in_progress",
            doctor: "Dr. Jennifer Martinez",
          },
          {
            id: "REC-1237",
            patientName: "Emily Davis",
            recordType: "follow_up",
            title: "Post-treatment Follow-up",
            diagnosis: "Healing progressing well",
            treatment: "Continue current care routine",
            date: "2023-06-12",
            status: "scheduled",
            doctor: "Dr. Jennifer Martinez",
          },
        ]

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = recordType === "all" || record.recordType === recordType

    return matchesSearch && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "scheduled":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

  return (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search records..."
            className="h-8 w-[150px] lg:w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Select value={recordType} onValueChange={setRecordType}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="examination">Examination</SelectItem>
              <SelectItem value="treatment">Treatment</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline-block">Export</span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            <span>New Record</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Record ID</TableHead>
              <TableHead>Patient</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Diagnosis</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Doctor</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.patientName}</TableCell>
                <TableCell>
                  <Badge className={getRecordTypeColor(record.recordType)}>{record.recordType.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell>{record.title}</TableCell>
                <TableCell className="hidden md:table-cell max-w-[200px] truncate">{record.diagnosis}</TableCell>
                <TableCell className="hidden md:table-cell">{record.date}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(record.status)}>{record.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{record.doctor}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Record</DropdownMenuItem>
                      <DropdownMenuItem>Print Record</DropdownMenuItem>
                      <DropdownMenuItem>Share with Patient</DropdownMenuItem>
                      <DropdownMenuItem>Add Follow-up</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <CreateMedicalRecordDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} tenant={tenant} />
    </div>
  )
}
