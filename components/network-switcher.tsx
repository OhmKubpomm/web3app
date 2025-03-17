"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Globe, Check } from "lucide-react"
import { useWeb3 } from "@/lib/web3-client"
import { toast } from "sonner"

// ข้อมูลเครือข่ายที่รองรับ
const NETWORKS = [
  {
    id: 1,
    name: "Ethereum",
    icon: "🔷",
    color: "bg-blue-500",
  },
  {
    id: 137,
    name: "Polygon",
    icon: "🟣",
    color: "bg-purple-500",
  },
  {
    id: 42161,
    name: "Arbitrum",
    icon: "🔵",
    color: "bg-blue-600",
  },
  {
    id: 10,
    name: "Optimism",
    icon: "🔴",
    color: "bg-red-500",
  },
  {
    id: 8453,
    name: "Base",
    icon: "🔷",
    color: "bg-blue-400",
  },
  {
    id: 11155111,
    name: "Sepolia",
    icon: "🧪",
    color: "bg-gray-500",
  },
]

export default function NetworkSwitcher() {
  const { chainId, switchNetwork, isConnected } = useWeb3()
  const [isOpen, setIsOpen] = useState(false)

  // ฟังก์ชันเปลี่ยนเครือข่าย
  const handleSwitchNetwork = async (networkId: number) => {
    if (!isConnected) {
      toast.error("กรุณาเชื่อมต่อกระเป๋าก่อน")
      return
    }

    try {
      await switchNetwork(networkId)
      setIsOpen(false)
    } catch (error) {
      console.error("Error switching network:", error)
    }
  }

  // หาเครือข่ายปัจจุบัน
  const currentNetwork = NETWORKS.find((network) => network.id === chainId) || {
    name: "Unknown",
    icon: "❓",
    color: "bg-gray-500",
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1 border-purple-500/30 bg-black/40">
          <span className="mr-1">{currentNetwork.icon}</span>
          <span className="hidden md:inline">{currentNetwork.name}</span>
          <Globe className="h-4 w-4 text-purple-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-lg border-purple-500/30">
        {NETWORKS.map((network) => (
          <DropdownMenuItem
            key={network.id}
            onClick={() => handleSwitchNetwork(network.id)}
            className="flex items-center gap-2 cursor-pointer hover:bg-purple-500/20"
          >
            <div className={`w-2 h-2 rounded-full ${network.color}`} />
            <span>{network.icon}</span>
            <span>{network.name}</span>
            {chainId === network.id && <Check className="h-4 w-4 ml-auto text-green-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

