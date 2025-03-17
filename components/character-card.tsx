"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sword, Shield, ArrowUp, Coins } from "lucide-react"
import { toast } from "sonner"
import { upgradeCharacter } from "@/lib/actions"

interface CharacterCardProps {
  character: any
  gameData: any
  onUpgrade: (updatedData: any) => void
  isProcessing: boolean
}

export default function CharacterCard({ character, gameData, onUpgrade, isProcessing }: CharacterCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)

  // คำนวณค่าอัพเกรด
  const upgradeCost = character.level * 25

  // ฟังก์ชันอัพเกรดตัวละคร
  const handleUpgrade = async () => {
    if (isProcessing || isUpgrading) return
    if (gameData.coins < upgradeCost) {
      toast.error("เหรียญไม่เพียงพอ", {
        description: `ต้องการ ${upgradeCost} เหรียญ`,
      })
      return
    }

    setIsUpgrading(true)

    try {
      const result = await upgradeCharacter(gameData.walletAddress, character.id, upgradeCost)

      if (result.success) {
        toast.success("อัพเกรดสำเร็จ", {
          description: `${character.name} เลเวล ${character.level} → ${character.level + 1}`,
        })
        onUpgrade(result.data)
      } else {
        toast.error("อัพเกรดล้มเหลว", {
          description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        })
      }
    } catch (error) {
      console.error("Error upgrading character:", error)
      toast.error("อัพเกรดล้มเหลว", {
        description: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      })
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative">
            {/* Magic UI: แทนรูปภาพด้วย Animation */}
            <div className="h-40 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* วงแสงเรืองรอบตัวละคร */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                  }}
                  className={`absolute inset-0 rounded-full blur-xl ${
                    character.level > 5
                      ? "bg-yellow-600/30"
                      : character.level > 3
                        ? "bg-blue-600/30"
                        : "bg-purple-600/30"
                  }`}
                />

                {/* ตัวละคร */}
                <div
                  className={`absolute inset-0 rounded-full border-2 ${
                    character.level > 5
                      ? "border-yellow-500/50 bg-yellow-900/30"
                      : character.level > 3
                        ? "border-blue-500/50 bg-blue-900/30"
                        : "border-purple-500/50 bg-purple-900/30"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sword
                      className={`h-10 w-10 ${
                        character.level > 5
                          ? "text-yellow-400"
                          : character.level > 3
                            ? "text-blue-400"
                            : "text-purple-400"
                      }`}
                    />
                  </div>
                </div>

                {/* เอฟเฟกต์เมื่อ hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -inset-4"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          x: Math.cos((i * Math.PI) / 4) * 30,
                          y: Math.sin((i * Math.PI) / 4) * 30,
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.1,
                        }}
                        className={`absolute w-2 h-2 rounded-full ${
                          character.level > 5 ? "bg-yellow-400" : character.level > 3 ? "bg-blue-400" : "bg-purple-400"
                        }`}
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* แสดงเลเวล */}
                <div className="absolute -bottom-2 -right-2 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-700">
                  <span className="text-xs font-bold">{character.level}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-center mb-2">{character.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span>พลังโจมตี</span>
                  </div>
                  <span className="font-mono">{character.damage}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>ความทนทาน</span>
                  </div>
                  <span className="font-mono">{character.level * 10}</span>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={gameData.coins < upgradeCost || isProcessing || isUpgrading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <ArrowUp className="h-4 w-4 mr-1" />
                อัพเกรด
                <div className="flex items-center ml-2 bg-black/30 px-2 py-0.5 rounded-full">
                  <Coins className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs">{upgradeCost}</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

