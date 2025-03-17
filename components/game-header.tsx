"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Coins, Sword, Zap, User, LogOut, Settings, Volume2, VolumeX } from "lucide-react"
import { toast } from "sonner"
import { useWeb3 } from "@/lib/web3-client"
import { useRouter } from "next/navigation"

interface GameHeaderProps {
  gameData: any
}

export default function GameHeader({ gameData }: GameHeaderProps) {
  const { address, disconnect } = useWeb3()
  const router = useRouter()
  const [isMuted, setIsMuted] = useState(false)

  // ฟังก์ชันออกจากเกม
  const handleLogout = () => {
    disconnect()
    document.cookie = "player_address=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
    toast.info("ออกจากเกมแล้ว")
    router.push("/")
  }

  // ฟังก์ชันเปิด/ปิดเสียง
  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast.info(isMuted ? "เปิดเสียงแล้ว" : "ปิดเสียงแล้ว")
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-between items-center">
          {/* โลโก้เกม */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }}
              className="bg-gradient-to-br from-purple-600 to-blue-600 p-1.5 rounded-lg"
            >
              <Sword className="h-5 w-5 text-white" />
            </motion.div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Adventure Clicker
            </h1>
          </div>

          {/* สถานะผู้เล่น */}
          <div className="flex items-center gap-4">
            {/* เหรียญ */}
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-yellow-500/20">
              <Coins className="h-4 w-4 text-yellow-400" />
              <motion.span
                key={gameData?.coins}
                initial={{ scale: 1.2, color: "#FBBF24" }}
                animate={{ scale: 1, color: "#D1D5DB" }}
                transition={{ duration: 0.3 }}
                className="font-mono font-medium text-gray-300"
              >
                {gameData?.coins?.toLocaleString() || 0}
              </motion.span>
            </div>

            {/* พลังโจมตี */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-red-500/20">
              <Sword className="h-4 w-4 text-red-400" />
              <span className="font-mono font-medium text-gray-300">{gameData?.damage || 1}</span>
            </div>

            {/* พลังโจมตีอัตโนมัติ */}
            <div className="hidden md:flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-blue-500/20">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="font-mono font-medium text-gray-300">{gameData?.autoDamage || 0}/s</span>
            </div>

            {/* เมนูผู้เล่น */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 border-purple-500/30 bg-black/40">
                  <User className="h-4 w-4 mr-2 text-purple-400" />
                  <span className="hidden md:inline mr-1">{address?.slice(0, 6)}...</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-black/90 backdrop-blur-lg border-purple-500/30">
                <DropdownMenuLabel>บัญชีผู้เล่น</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={toggleMute} className="cursor-pointer">
                  {isMuted ? (
                    <>
                      <VolumeX className="h-4 w-4 mr-2" />
                      <span>เปิดเสียง</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      <span>ปิดเสียง</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>ตั้งค่า</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>ออกจากเกม</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  )
}

