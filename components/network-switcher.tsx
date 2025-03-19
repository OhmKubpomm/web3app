"use client"

import { useState } from "react"
import { useNetwork, useSwitchNetwork } from "wagmi"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, ChevronDown, Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export default function NetworkSwitcher() {
  const { t } = useI18n()
  const { chain } = useNetwork()
  const { chains, switchNetwork } = useSwitchNetwork()
  const [open, setOpen] = useState(false)

  if (!chain || !switchNetwork) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{chain.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        {chains.map((option) => (
          <DropdownMenuItem
            key={option.id}
            className="flex cursor-pointer items-center justify-between"
            onClick={() => {
              switchNetwork(option.id)
              setOpen(false)
            }}
          >
            <span>{option.name}</span>
            {chain.id === option.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

