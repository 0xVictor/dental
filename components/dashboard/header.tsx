import Link from "next/link"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { TenantSwitcher } from "@/components/dashboard/tenant-switcher"
import { NotificationBell } from "@/components/notifications/notification-bell"

interface DashboardHeaderProps {
  user?: {
    id: string
    email: string
    name?: string
  } | null
  tenant?: {
    id: string
    name: string
    userRole?: string
  } | null
  userTenants?: {
    id: string
    name: string
    role: string
  }[]
}

export function DashboardHeader({ user, tenant, userTenants = [] }: DashboardHeaderProps) {
  // Safety checks
  if (!user || !tenant) {
    return (
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-14 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <MobileNav />
            <Link href="/dashboard" className="hidden items-center space-x-2 md:flex">
              <span className="hidden font-bold sm:inline-block">Loading...</span>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-14 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <MobileNav />
          <Link href="/dashboard" className="hidden items-center space-x-2 md:flex">
            <span className="hidden font-bold sm:inline-block">{tenant.name || "Dental Clinic"}</span>
          </Link>
          {userTenants && userTenants.length > 0 && (
            <TenantSwitcher
              tenants={userTenants}
              currentTenant={{
                id: tenant.id,
                name: tenant.name,
              }}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          {tenant.id && <NotificationBell tenantId={tenant.id} />}
          <UserNav user={user} />
        </div>
      </div>
    </header>
  )
}
