import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { AcceptInvitationForm } from "@/components/invitations/accept-invitation-form"

interface InvitePageProps {
  params: {
    token: string
  }
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = params
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })

  // Check if invitation exists and is valid
  const { data: invitation, error } = await supabase
    .from("invitations")
    .select(`
      *,
      tenants (
        name,
        address
      )
    `)
    .eq("token", token)
    .eq("status", "pending")
    .single()

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Invitation</h1>
          <p className="text-gray-600 mb-6">
            This invitation link is invalid or has expired. Please contact your clinic administrator for a new
            invitation.
          </p>
        </div>
      </div>
    )
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expires_at) < new Date()
  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invitation Expired</h1>
          <p className="text-gray-600 mb-6">
            This invitation has expired. Please contact your clinic administrator for a new invitation.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join {invitation.tenants?.name}</h1>
          <p className="text-gray-600">
            You've been invited to join {invitation.tenants?.name} as a {invitation.role}.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-2">Invitation Details</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Name:</span> {invitation.name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {invitation.email}
            </p>
            <p>
              <span className="font-medium">Role:</span> {invitation.role}
            </p>
            <p>
              <span className="font-medium">Clinic:</span> {invitation.tenants?.name}
            </p>
          </div>
          {invitation.message && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 italic">"{invitation.message}"</p>
            </div>
          )}
        </div>

        <AcceptInvitationForm token={token} />
      </div>
    </div>
  )
}
