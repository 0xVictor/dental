"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createTenantAction } from "@/app/actions/tenant"

interface OnboardingFormProps {
  user: any
}

export function OnboardingForm({ user }: OnboardingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    clinicName: "",
    address: "",
    phone: "",
    plan: "free",
  })
  const [errors, setErrors] = useState({
    clinicName: "",
    address: "",
    phone: "",
    plan: "",
  })

  const validateForm = () => {
    const newErrors = {
      clinicName: "",
      address: "",
      phone: "",
      plan: "",
    }

    if (!formData.clinicName || formData.clinicName.length < 2) {
      newErrors.clinicName = "Clinic name must be at least 2 characters."
    }

    if (!formData.address || formData.address.length < 5) {
      newErrors.address = "Address must be at least 5 characters."
    }

    if (!formData.phone || formData.phone.length < 8) {
      newErrors.phone = "Phone number must be at least 8 characters."
    }

    if (!formData.plan) {
      newErrors.plan = "Please select a plan."
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some((error) => error !== "")
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Create FormData for server action
      const formDataObj = new FormData()
      formDataObj.append("clinicName", formData.clinicName)
      formDataObj.append("address", formData.address)
      formDataObj.append("phone", formData.phone)
      formDataObj.append("plan", formData.plan)

      const result = await createTenantAction(formDataObj)

      if (result.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Clinic created",
        description: "Your dental clinic has been set up successfully.",
      })

      // Refresh the page to update server-side state
      router.refresh()
      router.push("/dashboard")
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="clinicName">Clinic Name</Label>
        <Input
          id="clinicName"
          name="clinicName"
          type="text"
          placeholder="Smile Dental Clinic"
          value={formData.clinicName}
          onChange={(e) => handleInputChange("clinicName", e.target.value)}
          disabled={isLoading}
          required
        />
        {errors.clinicName && <p className="text-sm text-red-600">{errors.clinicName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="123 Main St, City, Country"
          value={formData.address}
          onChange={(e) => handleInputChange("address", e.target.value)}
          disabled={isLoading}
          required
        />
        {errors.address && <p className="text-sm text-red-600">{errors.address}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+1 234 567 8900"
          value={formData.phone}
          onChange={(e) => handleInputChange("phone", e.target.value)}
          disabled={isLoading}
          required
        />
        {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="plan">Subscription Plan</Label>
        <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)} disabled={isLoading}>
          <SelectTrigger>
            <SelectValue placeholder="Select a plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Free - Up to 50 patients</SelectItem>
            <SelectItem value="pro">Pro - Unlimited patients + features</SelectItem>
            <SelectItem value="enterprise">Enterprise - Custom solutions</SelectItem>
          </SelectContent>
        </Select>
        {errors.plan && <p className="text-sm text-red-600">{errors.plan}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating clinic..." : "Create Clinic"}
      </Button>
    </form>
  )
}
