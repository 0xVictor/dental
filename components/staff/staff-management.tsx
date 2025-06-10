"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Trash2, Edit } from "lucide-react"
import { InviteStaffDialog } from "./invite-staff-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { removeStaffMember } from "@/app/actions/tenant"
import { useRouter } from "next/navigation"

interface StaffMember {
  id: string
  name: string
  email: string
  role: string
  status: string
}

interface StaffManagementProps {
  initialStaffMembers: StaffMember[]
}

export function StaffManagement({ initialStaffMembers }: StaffManagementProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffMembers)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [staffToRemove, setStaffToRemove] = useState<StaffMember | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)
  const router = useRouter()

  const handleInviteSuccess = (newStaff: StaffMember) => {
    setStaffMembers([...staffMembers, newStaff])
    setShowInviteDialog(false)
  }

  const handleRemoveStaff = async () => {
    if (!staffToRemove) return

    try {
      setIsRemoving(true)
      await removeStaffMember(staffToRemove.id)
      setStaffMembers(staffMembers.filter((staff) => staff.id !== staffToRemove.id))
      setStaffToRemove(null)
      router.refresh()
    } catch (error) {
      console.error("Failed to remove staff member:", error)
    } finally {
      setIsRemoving(false)
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "admin":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "dentist":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "hygienist":
        return "bg-teal-100 text-teal-800 hover:bg-teal-200"
      case "assistant":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "receptionist":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "inactive":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Staff Members</CardTitle>
            <CardDescription>Manage your clinic staff and their access levels</CardDescription>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Staff
          </Button>
        </CardHeader>
        <CardContent>
          {staffMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UserPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No staff members yet</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Invite staff members to your clinic to get started
              </p>
              <Button onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Staff
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.name}</TableCell>
                    <TableCell>{staff.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(staff.role)} variant="outline">
                        {staff.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(staff.status)} variant="outline">
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // Send email reminder if status is pending
                            if (staff.status === "pending") {
                              // TODO: Implement email reminder
                              alert("Email reminder sent!")
                            }
                          }}
                          disabled={staff.status !== "pending"}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            // TODO: Implement edit staff
                            alert("Edit staff not implemented yet")
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setStaffToRemove(staff)}
                          disabled={staff.role === "owner"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3">
          <p className="text-xs text-muted-foreground">
            Staff members will receive an email invitation to join your clinic
          </p>
        </CardFooter>
      </Card>

      <InviteStaffDialog open={showInviteDialog} onOpenChange={setShowInviteDialog} onSuccess={handleInviteSuccess} />

      <AlertDialog open={!!staffToRemove} onOpenChange={(open) => !open && setStaffToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove staff member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staffToRemove?.name} from your clinic? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStaff}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
