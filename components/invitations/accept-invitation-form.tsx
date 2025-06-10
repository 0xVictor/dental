"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { acceptInvitationAction, declineInvitationAction } from "@/app/actions/invitations"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

interface AcceptInvitationFormProps {
  token: string
}

export function AcceptInvitationForm({ token }: AcceptInvitationFormProps) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isAccepting, setIsAccepting] = useState(false)
  const [isDeclining, setIsDeclining] = useState(false)
  const router = useRouter()

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      })
      return
    }

    try {
      setIsAccepting(true)
      const result = await acceptInvitationAction(token, { password })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      })

      // Redirect to login page
      router.push("/login?message=Account created successfully. Please log in.")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAccepting(false)
    }
  }

  const handleDecline = async () => {
    try {
      setIsDeclining(true)
      const result = await declineInvitationAction(token)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Invitation Declined",
        description: "You have declined the invitation.",
      })

      // Redirect to home page
      router.push("/")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeclining(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAccept} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Create Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            minLength={6}
          />
        </div>
        <div className="flex gap-3">
          <Button type="submit" className="flex-1" disabled={isAccepting || isDeclining}>
            {isAccepting ? "Creating Account..." : "Accept & Join"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDecline}
            disabled={isAccepting || isDeclining}
            className="flex-1"
          >
            {isDeclining ? "Declining..." : "Decline"}
          </Button>
        </div>
      </form>
    </div>
  )
}
