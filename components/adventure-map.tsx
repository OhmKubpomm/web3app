"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Skull, Coins, ArrowRight, Lock } from "lucide-react"
import Image from "next/image"

interface AdventureMapProps {
  gameData: any
  onChangeArea: (area: string) => void
}

export default function AdventureMap({ gameData, onChangeArea }: AdventureMapProps) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null)

  // ข้อมูลพื้นที่ผจญภัย
  const areas = [
    {
      id: "ป่า",
      name: "ป่าลึกลับ",
      description: "ป่าที่เต็มไปด้วยสัตว์ป่าและสิ่งมีชีวิตแปลกประหลาด",
      difficulty: "ง่าย",
      rewards: "10-25 เหรียญ",
      monsters: ["สไลม์", "หมาป่า", "งูยักษ์", "กระต่ายป่า", "เห็ดมีพิษ"],
      image: "/placeholder.svg?height=200&width=300",
      color: "from-green-800 to-green-600",
      unlocked: true,
    },
    {
      id: "ถ้ำ",
      name: "ถ้ำมืดมิด",
      description: "ถ้ำลึกลับที่เต็มไปด้วยสมบัติและอันตราย",
      difficulty: "ปานกลาง",
      rewards: "25-50 เหรียญ",
      monsters: ["ค้างคาวยักษ์", "โกเล็ม", "แมงมุมยักษ์", "โครงกระดูกเดินได้", "ทรอลล์"],
      image: "/placeholder.svg?height=200&width=300",
      color: "from-gray-800 to-gray-600",
      unlocked: gameData.damage >= 10,
    },
    {
      id: "วิหาร",
      name: "วิหารโบราณ",
      description: "วิหารที่ถูกทิ้งร้างมานาน เต็มไปด้วยปีศาจและสมบัติล้ำค่า",
      difficulty: "ยาก",
      rewards: "50-100 เหรียญ",
      monsters: ["ปีศาจ", "มัมมี่", "ราชันย์ซอมบี้", "อสูรเวทมนตร์", "ปีศาจไฟ"],
      image: "/placeholder.svg?height=200&width=300",
      color: "from-amber-800 to-amber-600",
      unlocked: gameData.damage >= 30,
    },
  ]

  // ฟังก์ชันเลือกพื้นที่
  const handleSelectArea = (area: string) => {
    setSelectedArea(area)
  }

  // ฟังก์ชันเปลี่ยนพื้นที่
  const handleChangeArea = () => {
    if (selectedArea) {
      onChangeArea(selectedArea)
      setSelectedArea(null)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-purple-400" />
        <span>แผนที่การผจญภัย</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {areas.map((area) => (
          <motion.div
            key={area.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden rounded-xl border ${
              gameData.currentArea === area.id ? "border-purple-500" : "border-gray-700"
            } cursor-pointer`}
            onClick={() => area.unlocked && handleSelectArea(area.id)}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${area.color} opacity-50`}></div>

            <div className="relative p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">{area.name}</h3>
                {gameData.currentArea === area.id && <Badge className="bg-purple-600">ปัจจุบัน</Badge>}
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className={`
                    ${
                      area.difficulty === "ง่าย"
                        ? "bg-green-500/20 text-green-300 border-green-500"
                        : area.difficulty === "ปานกลาง"
                          ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                          : "bg-red-500/20 text-red-300 border-red-500"
                    }
                  `}
                >
                  {area.difficulty}
                </Badge>

                <div className="flex items-center gap-1 text-yellow-400 text-sm">
                  <Coins className="h-3.5 w-3.5" />
                  <span>{area.rewards}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-2">{area.description}</p>

              <div className="flex flex-wrap gap-1 mb-2">
                {area.monsters.slice(0, 3).map((monster, index) => (
                  <Badge key={index} variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                    <Skull className="h-3 w-3 mr-1 text-red-400" />
                    {monster}
                  </Badge>
                ))}
                {area.monsters.length > 3 && (
                  <Badge variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                    +{area.monsters.length - 3}
                  </Badge>
                )}
              </div>

              {!area.unlocked && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-400">ต้องการพลังโจมตี {area.id === "ถ้ำ" ? "10" : "30"} ขึ้นไป</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedArea && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
          >
            {areas.find((area) => area.id === selectedArea) && (
              <>
                <h3 className="text-lg font-bold mb-4">
                  เดินทางไปยัง {areas.find((area) => area.id === selectedArea)?.name}
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image
                      src={areas.find((area) => area.id === selectedArea)?.image || "/placeholder.svg"}
                      alt={selectedArea}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-2">
                      {areas.find((area) => area.id === selectedArea)?.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            areas.find((area) => area.id === selectedArea)?.difficulty === "ง่าย"
                              ? "bg-green-500/20 text-green-300 border-green-500"
                              : areas.find((area) => area.id === selectedArea)?.difficulty === "ปานกลาง"
                                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                                : "bg-red-500/20 text-red-300 border-red-500"
                          }
                        `}
                      >
                        ความยาก: {areas.find((area) => area.id === selectedArea)?.difficulty}
                      </Badge>

                      <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-500">
                        <Coins className="h-3.5 w-3.5 mr-1" />
                        {areas.find((area) => area.id === selectedArea)?.rewards}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedArea(null)}>
                    ยกเลิก
                  </Button>
                  <Button onClick={handleChangeArea}>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    เดินทาง
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

