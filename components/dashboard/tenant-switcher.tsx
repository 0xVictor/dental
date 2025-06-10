"use client"

import type * as React from "react"
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useRouter } from "next/navigation"
import { createTenant, switchTenant } from "@/app/actions/tenant"
import { useState } from "react"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface TenantSwitcherProps extends PopoverTriggerProps {
  tenants: {
    id: string
    name: string
    role: string
  }[]
  currentTenant?: {
    id: string
    name: string
  }
}

export function TenantSwitcher({ className, tenants = [], currentTenant }: TenantSwitcherProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showNewTenantDialog, setShowNewTenantDialog] = useState(false)
  const [newTenantName, setNewTenantName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  const onTenantSelect = async (tenantId: string) => {
    if (currentTenant?.id === tenantId) {
      setOpen(false)
      return
    }

    try {
      setIsSwitching(true)
      await switchTenant(tenantId)
      router.refresh()
      setOpen(false)
    } catch (error) {
      console.error("Failed to switch tenant:", error)
    } finally {
      setIsSwitching(false)
    }
  }

  const onCreateTenant = async () => {
    if (!newTenantName) return

    try {
      setIsCreating(true)
      await createTenant(newTenantName)
      setNewTenantName("")
      setShowNewTenantDialog(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create tenant:", error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={showNewTenantDialog} onOpenChange={setShowNewTenantDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a clinic"
            className={cn("w-[200px] justify-between", className)}
          >
            {currentTenant?.name || "Select clinic"}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandList>
              <CommandInput placeholder="Search clinic..." />
              <CommandEmpty>No clinic found.</CommandEmpty>
              {tenants.length > 0 && (
                <CommandGroup heading="Clinics">
                  {tenants.map((tenant) => (
                    <CommandItem
                      key={tenant.id}
                      onSelect={() => onTenantSelect(tenant.id)}
                      className="text-sm"
                      disabled={isSwitching}
                    >
                      <span>{tenant.name}</span>
                      {tenant.id === currentTenant?.id && <Check className="ml-auto h-4 w-4" />}
                      <span className="ml-auto text-xs text-muted-foreground">{tenant.role}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem onSelect={() => setShowNewTenantDialog(true)} className="cursor-pointer">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Clinic
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create clinic</DialogTitle>
          <DialogDescription>Add a new dental clinic to your account</DialogDescription>
        </DialogHeader>
        <div>
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="name">Clinic name</Label>
              <Input
                id="name"
                placeholder="Acme Dental Clinic"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowNewTenantDialog(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={onCreateTenant} disabled={!newTenantName || isCreating}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
