"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"
import Image from "next/image"

interface AdventureAreaProps {
  name: string
  description: string
  image: string
  isActive: boolean
  onSelect: () => void
  requiredLevel?: number
}

export default function AdventureArea({
  name,
  description,
  image,
  isActive,
  onSelect,
  requiredLevel = 0,
}: AdventureAreaProps) {
  const isLocked = requiredLevel > 0

  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
      <Card
        className={`cursor-pointer overflow-hidden transition-all duration-300 ${
          isActive
            ? "border-yellow-400 shadow-lg shadow-yellow-400/20"
            : "border-purple-500 bg-black/40 backdrop-blur-sm"
        }`}
        onClick={onSelect}
      >
        <div className="relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={name}
            width={200}
            height={100}
            className="w-full h-32 object-cover"
          />
          {isLocked && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center flex-col">
              <Lock className="h-8 w-8 text-gray-400" />
              <span className="text-sm mt-1 text-gray-300">ต้องการระดับ {requiredLevel}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-bold text-lg mb-1">{name}</h3>
          <p className="text-sm text-gray-300">{description}</p>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between">
          {isActive ? (
            <Badge variant="outline" className="bg-yellow-500/20 text-yellow-300 border-yellow-400">
              กำลังสำรวจ
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-transparent">
              เลือกพื้นที่
            </Badge>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  )
}

