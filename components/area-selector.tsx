"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { changeArea } from "@/lib/actions"

interface AreaSelectorProps {
  gameData: any
  onAreaChange: (updatedData: any) => void
  isProcessing: boolean
}

// ข้อมูลพื้นที่
const AREAS = [
  {
    id: "ป่า",
    name: "ป่า",
    description: "พื้นที่เริ่มต้นที่มีมอนสเตอร์ระดับต้น",
    color: "from-green-900 to-green-700",
    icon: "🌲",
    level: 1,
  },
  {
    id: "ถ้ำ",
    name: "ถ้ำ",
    description: "พื้นที่ที่มีมอนสเตอร์ระดับกลาง",
    color: "from-gray-900 to-gray-700",
    icon: "🏔️",
    level: 5,
  },
  {
    id: "ทะเลทราย",
    name: "ทะเลทราย",
    description: "พื้นที่ที่มีมอนสเตอร์ระดับสูง",
    color: "from-yellow-900 to-yellow-700",
    icon: "🏜️",
    level: 10,
  },
  {
    id: "ภูเขาไฟ",
    name: "ภูเขาไฟ",
    description: "พื้นที่ที่มีมอนสเตอร์ระดับสูงสุด",
    color: "from-red-900 to-red-700",
    icon: "🌋",
    level: 15,
  },
]

export default function AreaSelector({ gameData, onAreaChange, isProcessing }: AreaSelectorProps) {
  const [isChangingArea, setIsChangingArea] = useState(false)
  const currentArea = gameData?.currentArea || "ป่า"

  // ฟังก์ชันเปลี่ยนพื้นที่
  const handleChangeArea = async (areaId: string) => {
    if (isProcessing || isChangingArea) return
    if (areaId === currentArea) return

    // เช็คเลเวลขั้นต่ำ
    const area = AREAS.find((a) => a.id === areaId)
    const playerLevel = Math.max(...(gameData?.characters?.map((c: any) => c.level) || [1]))

    if (area && playerLevel < area.level) {
      toast.error("เลเวลไม่เพียงพอ", {
        description: `ต้องการเลเวล ${area.level} ขึ้นไป`,
      })
      return
    }

    setIsChangingArea(true)

    try {
      const result = await changeArea(gameData.walletAddress, areaId)

      if (result.success) {
        toast.success("เปลี่ยนพื้นที่สำเร็จ", {
          description: `เดินทางไปยัง${areaId}แล้ว`,
        })
        onAreaChange(result.data)
      } else {
        toast.error("เปลี่ยนพื้นที่ล้มเหลว", {
          description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        })
      }
    } catch (error) {
      console.error("Error changing area:", error)
      toast.error("เปลี่ยนพื้นที่ล้มเหลว", {
        description: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      })
    } finally {
      setIsChangingArea(false)
    }
  }

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-bold">พื้นที่ผจญภัย</h2>
        </div>

        <div className="space-y-3">
          {AREAS.map((area) => {
            const isCurrentArea = area.id === currentArea
            const isLocked = Math.max(...(gameData?.characters?.map((c: any) => c.level) || [1])) < area.level

            return (
              <motion.div
                key={area.id}
                whileHover={{
                  scale: isLocked ? 1 : 1.02,
                }}
                className={`relative rounded-lg overflow-hidden ${
                  isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => !isLocked && handleChangeArea(area.id)}
              >
                <div className={`bg-gradient-to-r ${area.color} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{area.icon}</div>
                      <div>
                        <h3 className="font-bold">{area.name}</h3>
                        <p className="text-xs text-gray-200">{area.description}</p>
                      </div>
                    </div>

                    {isCurrentArea ? (
                      <div className="bg-white/20 px-2 py-1 rounded-full text-xs">ปัจจุบัน</div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full text-xs">
                        <span>ต้องการเลเวล {area.level}</span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-black/30 border-white/20"
                        disabled={isChangingArea || isProcessing}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Magic UI: เอฟเฟกต์พื้นที่ */}
                <div className="absolute inset-0 pointer-events-none">
                  {area.id === "ป่า" && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0.3,
                          }}
                          animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: Math.random() * 5 + 5,
                          }}
                          className="absolute w-1 h-1 bg-green-300 rounded-full blur-sm"
                        />
                      ))}
                    </>
                  )}

                  {area.id === "ถ้ำ" && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0.3,
                          }}
                          animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: Math.random() * 5 + 5,
                          }}
                          className="absolute w-1 h-1 bg-blue-300 rounded-full blur-sm"
                        />
                      ))}
                    </>
                  )}

                  {area.id === "ทะเลทราย" && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0.3,
                          }}
                          animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: Math.random() * 5 + 5,
                          }}
                          className="absolute w-1 h-1 bg-yellow-300 rounded-full blur-sm"
                        />
                      ))}
                    </>
                  )}

                  {area.id === "ภูเขาไฟ" && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: 0.3,
                          }}
                          animate={{
                            x: Math.random() * 100,
                            y: Math.random() * 100,
                            opacity: [0.3, 0.6, 0.3],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: Math.random() * 5 + 5,
                          }}
                          className="absolute w-1 h-1 bg-red-300 rounded-full blur-sm"
                        />
                      ))}
                    </>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

