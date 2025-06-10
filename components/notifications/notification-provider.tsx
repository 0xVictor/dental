"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "@/components/ui/use-toast"

interface NotificationContextType {
  notifications: any[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

interface NotificationProviderProps {
  children: React.ReactNode
  tenantId?: string // Make tenantId optional
}

export function NotificationProvider({ children, tenantId }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<any[]>([])
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Only set up subscriptions if tenantId is available
    if (!tenantId) {
      return
    }

    // Subscribe to real-time notifications
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          const newNotification = payload.new
          setNotifications((prev) => [newNotification, ...prev])

          // Show toast notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          })
        },
      )
      .subscribe()

    // Subscribe to appointment updates
    const appointmentChannel = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `tenant_id=eq.${tenantId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            toast({
              title: "New Appointment",
              description: "A new appointment has been scheduled.",
            })
          } else if (payload.eventType === "UPDATE") {
            toast({
              title: "Appointment Updated",
              description: "An appointment has been modified.",
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
      supabase.removeChannel(appointmentChannel)
    }
  }, [tenantId, supabase])

  const markAsRead = async (id: string) => {
    if (!tenantId) return

    await supabase.from("notifications").update({ read: true }).eq("id", id).eq("tenant_id", tenantId)

    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = async () => {
    if (!tenantId) return

    await supabase.from("notifications").update({ read: true }).eq("tenant_id", tenantId).eq("read", false)

    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  return (
    <NotificationContext.Provider value={{ notifications, markAsRead, markAllAsRead }}>
      {children}
    </NotificationContext.Provider>
  )
}
