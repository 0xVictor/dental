import type { Metadata } from "next"
import { StaffManagement } from "@/components/staff/staff-management"
import { getStaffMembers } from "@/lib/tenant"

export const metadata: Metadata = {
  title: "Staff Management",
  description: "Manage your clinic staff members",
}

export default async function StaffPage() {
  const staffMembers = await getStaffMembers()

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
        <p className="text-muted-foreground">Manage your clinic staff members and their roles</p>
      </div>
      <StaffManagement initialStaffMembers={staffMembers} />
    </div>
  )
}
