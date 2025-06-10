"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"

const navigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Icons.dashboard,
  },
  {
    title: "Patients",
    href: "/dashboard/patients",
    icon: Icons.users,
  },
  {
    title: "Calendar",
    href: "/dashboard/calendar",
    icon: Icons.calendar,
  },
  {
    title: "Medical Records",
    href: "/dashboard/records",
    icon: Icons.fileText,
  },
  {
    title: "Financial",
    href: "/dashboard/financial",
    icon: Icons.dollarSign,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: Icons.folder,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Icons.settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <Link href="/dashboard" className="flex items-center" onClick={() => setOpen(false)}>
          <Icons.logo className="mr-2 h-4 w-4" />
          <span className="font-bold">DentalFlow</span>
        </Link>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center text-sm font-medium",
                  pathname === item.href ? "text-foreground" : "text-foreground/60 hover:text-foreground/80",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
