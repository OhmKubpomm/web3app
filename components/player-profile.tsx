"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, Star, Sword, Shield, Sparkles, Trophy, Clock } from "lucide-react"
import Image from "next/image"
import { formatAddress } from "@/lib/utils"

interface PlayerProfileProps {
  gameData: any
  address: string | null
}

export default function PlayerProfile({ gameData, address }: PlayerProfileProps) {
  const [showStats, setShowStats] = useState(false)

  // คำนวณเลเวลของผู้เล่นจากค่าเฉลี่ยของตัวละคร
  const calculatePlayerLevel = () => {
    if (!gameData || !gameData.characters || gameData.characters.length === 0) return 1

    const totalLevel = gameData.characters.reduce((sum: number, char: any) => sum + char.level, 0)
    return Math.floor(totalLevel / gameData.characters.length)
  }

  // คำนวณ XP ปัจจุบันและ XP ที่ต้องการสำหรับเลเวลถัดไป
  const calculateXP = () => {
    const level = calculatePlayerLevel()
    const currentXP = Math.floor(Math.random() * 100) // สมมติว่าเป็นค่าสุ่ม (ควรมาจากฐานข้อมูลจริง)
    const requiredXP = level * 100

    return { currentXP, requiredXP, percentage: (currentXP / requiredXP) * 100 }
  }

  // คำนวณสถิติการเล่น
  const calculateStats = () => {
    return {
      monstersKilled: 150, // สมมติว่าเป็นค่าคงที่ (ควรมาจากฐานข้อมูลจริง)
      itemsCollected: gameData?.inventory?.length || 0,
      totalCoins: gameData?.coins || 0,
      playTime: "5 ชั่วโมง", // สมมติว่าเป็นค่าคงที่ (ควรมาจากฐานข้อมูลจริง)
      highestDamage: gameData?.damage * (gameData?.upgrades?.damageMultiplier || 1) || 0,
    }
  }

  // คำนวณตำแหน่งของผู้เล่น
  const calculateRank = () => {
    const level = calculatePlayerLevel()

    if (level < 5) return "นักผจญภัยมือใหม่"
    if (level < 10) return "นักผจญภัยมืออาชีพ"
    if (level < 15) return "นักล่าอสูร"
    if (level < 20) return "ราชันย์นักรบ"
    return "ตำนานนักผจญภัย"
  }

  const playerLevel = calculatePlayerLevel()
  const xpInfo = calculateXP()
  const stats = calculateStats()
  const rank = calculateRank()

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-400" />
          <span>โปรไฟล์นักผจญภัย</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {showStats ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">สถิติการเล่น</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowStats(false)}>
                  กลับ
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">มอนสเตอร์ที่สังหาร</span>
                  </div>
                  <p className="text-lg font-bold">{stats.monstersKilled}</p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">ไอเทมที่เก็บได้</span>
                  </div>
                  <p className="text-lg font-bold">{stats.itemsCollected}</p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">พลังโจมตีสูงสุด</span>
                  </div>
                  <p className="text-lg font-bold">{stats.highestDamage.toFixed(1)}</p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">เวลาเล่น</span>
                  </div>
                  <p className="text-lg font-bold">{stats.playTime}</p>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-gray-300">ตำแหน่ง</span>
                </div>
                <p className="text-lg font-bold text-amber-300">{rank}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Image
                      src="/placeholder.svg?height=60&width=60"
                      alt="Avatar"
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-yellow-300">
                    {playerLevel}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold">{address ? formatAddress(address) : "นักผจญภัย"}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge className="bg-amber-600/80 text-white">
                      <Trophy className="h-3 w-3 mr-1" />
                      {rank}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    เลเวล {playerLevel}
                  </span>
                  <span>
                    {xpInfo.currentXP}/{xpInfo.requiredXP} XP
                  </span>
                </div>
                <Progress value={xpInfo.percentage} className="h-2 bg-black/50" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">พลังโจมตี</span>
                  </div>
                  <p className="text-lg font-bold">
                    {(gameData?.damage * (gameData?.upgrades?.damageMultiplier || 1)).toFixed(1)}
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">พลังอัตโนมัติ</span>
                  </div>
                  <p className="text-lg font-bold">{gameData?.autoDamage || 0}/วิ</p>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full border-purple-500/50 hover:bg-purple-500/20"
                onClick={() => setShowStats(true)}
              >
                ดูสถิติเพิ่มเติม
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

