"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarDays, CreditCard, FileText, Home, Settings, Users, Wallet } from "lucide-react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface DashboardNavProps {
  tenant: any
}

export function DashboardNav({ tenant }: DashboardNavProps) {
  const pathname = usePathname()

  const items = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Patients",
      href: "/dashboard/patients",
      icon: Users,
    },
    {
      title: "Calendar",
      href: "/dashboard/calendar",
      icon: CalendarDays,
    },
    {
      title: "Medical Records",
      href: "/dashboard/records",
      icon: FileText,
      disabled: tenant.plan === "free",
    },
    {
      title: "Financial",
      href: "/dashboard/financial",
      icon: Wallet,
      disabled: tenant.plan === "free",
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: CreditCard,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <nav className="grid items-start gap-2">
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.disabled ? "#" : item.href}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              pathname === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
              "justify-start",
              item.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
            {item.disabled && (
              <span className="ml-auto rounded-md bg-primary px-1.5 py-0.5 text-[0.625rem] text-primary-foreground">
                PRO
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
