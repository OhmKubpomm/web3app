"use client"

import { Button } from "@/components/ui/button"
import { Wallet } from "lucide-react"

interface Web3StatusProps {
  isConnected: boolean
  onConnect: () => void
}

export default function Web3Status({ isConnected, onConnect }: Web3StatusProps) {
  return (
    <div>
      {isConnected ? (
        <Button variant="outline" className="border-green-500 text-green-400">
          <Wallet className="mr-2 h-4 w-4" />
          เชื่อมต่อกระเป๋าแล้ว
        </Button>
      ) : (
        <Button variant="outline" onClick={onConnect}>
          <Wallet className="mr-2 h-4 w-4" />
          เชื่อมต่อกระเป๋า
        </Button>
      )}
    </div>
  )
}

