"use client";

import { useState } from "react";
import { useChains, useChainId, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function NetworkSwitcher() {
  const { t } = useI18n();
  const chains = useChains();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [open, setOpen] = useState(false);

  // หาข้อมูลของเชนปัจจุบัน
  const currentChain = chains.find(c => c.id === chainId);

  if (!currentChain || !switchChain) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>{currentChain.name}</span>
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
              switchChain({ chainId: option.id });
              setOpen(false);
            }}
          >
            <span>{option.name}</span>
            {chainId === option.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
