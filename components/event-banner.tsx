"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Sparkles, Clock } from "lucide-react"
import Image from "next/image"

interface EventBannerProps {
  onEventClick: () => void
}

export default function EventBanner({ onEventClick }: EventBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [event, setEvent] = useState<any>(null)

  // สุ่มเหตุการณ์พิเศษ
  useEffect(() => {
    const events = [
      {
        id: 1,
        title: "เทศกาลล่ามังกร",
        description: "มังกรปรากฏตัวในทุกพื้นที่! รับเหรียญและไอเทมเพิ่มขึ้น 2 เท่า",
        image: "/placeholder.svg?height=100&width=200",
        duration: "3 วัน",
        color: "from-red-600 to-orange-600",
      },
      {
        id: 2,
        title: "ปริศนาโบราณ",
        description: "ค้นพบสมบัติโบราณที่ซ่อนอยู่ในวิหาร รับไอเทมระดับตำนาน",
        image: "/placeholder.svg?height=100&width=200",
        duration: "2 วัน",
        color: "from-purple-600 to-blue-600",
      },
      {
        id: 3,
        title: "การแข่งขันนักล่า",
        description: "แข่งขันกับผู้เล่นอื่นเพื่อชิงตำแหน่งนักล่าอันดับ 1",
        image: "/placeholder.svg?height=100&width=200",
        duration: "5 วัน",
        color: "from-green-600 to-teal-600",
      },
    ]

    // สุ่มเลือกเหตุการณ์
    const randomEvent = events[Math.floor(Math.random() * events.length)]
    setEvent(randomEvent)

    // แสดงเหตุการณ์หลังจากโหลดหน้าเว็บ 2 วินาที
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!event) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <Card className={`bg-gradient-to-r ${event.color} text-white overflow-hidden shadow-lg border-0`}>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 text-white hover:bg-white/20 z-10"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>

              <div className="flex items-center p-4">
                <div className="relative w-16 h-16 mr-4 rounded-lg overflow-hidden">
                  <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-yellow-300" />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <p className="text-sm text-white/80">{event.description}</p>

                  <div className="flex items-center mt-2 text-xs text-white/70">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>เหลือเวลาอีก {event.duration}</span>
                  </div>
                </div>
              </div>

              <div className="px-4 pb-4">
                <Button
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  onClick={() => {
                    onEventClick()
                    setIsVisible(false)
                  }}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  เข้าร่วมกิจกรรม
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

