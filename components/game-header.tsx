"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Coins, Sword, Zap, Volume2, VolumeX, Menu } from "lucide-react"
import { toast } from "sonner"
import { UserAccount } from "@/components/user-account"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface GameHeaderProps {
  gameData: any
}

export default function GameHeader({ gameData }: GameHeaderProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showCoinsAnimation, setShowCoinsAnimation] = useState(false)
  const [prevCoins, setPrevCoins] = useState(gameData?.coins || 0)

  // ฟังก์ชันเปิด/ปิดเสียง
  const toggleMute = () => {
    setIsMuted(!isMuted)
    toast.info(isMuted ? "เปิดเสียงแล้ว" : "ปิดเสียงแล้ว", {
      position: "top-right", // แสดงที่มุมบนขวา ไม่บังปุ่มต่างๆ
    })
  }

  // ตรวจจับการเลื่อนหน้า
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // แสดงแอนิเมชันเมื่อเหรียญเปลี่ยน
  useEffect(() => {
    if (gameData?.coins !== prevCoins) {
      setShowCoinsAnimation(true)
      const timer = setTimeout(() => {
        setShowCoinsAnimation(false)
        setPrevCoins(gameData?.coins || 0)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [gameData?.coins, prevCoins])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300", // ลด z-index ลงเพื่อไม่ให้บังการแจ้งเตือน
        isScrolled
          ? "bg-black/60 backdrop-blur-md border-b border-purple-500/20 shadow-lg"
          : "bg-black/40 backdrop-blur-sm",
      )}
    >
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

          {/* สถานะผู้เล่น - แสดงบนมือถือ */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 border-purple-500/30 bg-black/40">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black/90 backdrop-blur-lg border-purple-500/30">
                <SheetHeader>
                  <SheetTitle className="text-left">สถานะผู้เล่น</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-purple-500/20">
                      <Coins className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-sm text-gray-400">เหรียญ</p>
                        <p className="font-bold">{gameData?.coins?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-purple-500/20">
                      <Sword className="h-5 w-5 text-red-400" />
                      <div>
                        <p className="text-sm text-gray-400">พลังโจมตี</p>
                        <p className="font-bold">{gameData?.damage || 1}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-purple-500/20">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-400">พลังอัตโนมัติ</p>
                        <p className="font-bold">{gameData?.autoDamage || 0}/วิ</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      variant="outline"
                      onClick={toggleMute}
                      className="w-full justify-start border-purple-500/30"
                    >
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
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* สถานะผู้เล่น - แสดงบนเดสก์ท็อป */}
          <div className="hidden md:flex items-center gap-4">
            {/* เหรียญ */}
            <div className="relative">
              <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-yellow-500/20">
                <Coins className="h-4 w-4 text-yellow-400" />
                <AnimatePresence mode="sync">
                  {showCoinsAnimation && gameData?.coins > prevCoins ? (
                    <motion.div
                      key="coins-increase"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 20, opacity: 0 }}
                      className="absolute -top-6 right-0 text-xs font-medium text-green-400"
                    >
                      +{gameData.coins - prevCoins}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
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
            </div>

            {/* พลังโจมตี */}
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-red-500/20">
              <Sword className="h-4 w-4 text-red-400" />
              <span className="font-mono font-medium text-gray-300">{gameData?.damage || 1}</span>
            </div>

            {/* พลังโจมตีอัตโนมัติ */}
            <div className="flex items-center gap-1.5 bg-black/30 px-3 py-1 rounded-full border border-blue-500/20">
              <Zap className="h-4 w-4 text-blue-400" />
              <span className="font-mono font-medium text-gray-300">{gameData?.autoDamage || 0}/วิ</span>
            </div>

            {/* ปุ่มเปิด/ปิดเสียง */}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-purple-500/30 bg-black/40"
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>

            {/* User Account */}
            <UserAccount gameData={gameData} />
          </div>
        </div>
      </div>
    </header>
  )
}

