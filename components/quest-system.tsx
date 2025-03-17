"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollText, CheckCircle2, Clock, Gift, Coins } from "lucide-react"
import { toast } from "sonner"
import { completeQuest } from "@/lib/actions"

interface QuestSystemProps {
  gameData: any
  onQuestComplete: (reward: number) => void
  isProcessing: boolean
}

export default function QuestSystem({ gameData, onQuestComplete, isProcessing }: QuestSystemProps) {
  const [quests, setQuests] = useState<any[]>([])
  const [activeQuest, setActiveQuest] = useState<any | null>(null)
  const [showReward, setShowReward] = useState(false)
  const [questReward, setQuestReward] = useState(0)

  // สร้างภารกิจประจำวัน
  useEffect(() => {
    if (!gameData) return

    // ตรวจสอบว่ามีภารกิจในข้อมูลเกมหรือไม่
    if (gameData.quests) {
      setQuests(gameData.quests)
    } else {
      // สร้างภารกิจใหม่
      generateDailyQuests()
    }
  }, [gameData])

  // สร้างภารกิจประจำวัน
  const generateDailyQuests = () => {
    const currentArea = gameData.currentArea
    const playerLevel = Math.max(...gameData.characters.map((c: any) => c.level))

    const newQuests = [
      {
        id: 1,
        title: "ล่ามอนสเตอร์",
        description: `สังหารมอนสเตอร์ในพื้นที่ ${currentArea} จำนวน 10 ตัว`,
        reward: 50 * (currentArea === "ป่า" ? 1 : currentArea === "ถ้ำ" ? 2 : 3),
        progress: Math.floor(Math.random() * 10),
        target: 10,
        type: "monster",
        completed: false,
        areaRequired: currentArea,
        image: "monster-slay.png",
      },
      {
        id: 2,
        title: "เก็บสมบัติ",
        description: "เก็บไอเทมจำนวน 3 ชิ้น",
        reward: 100,
        progress: Math.min(gameData.inventory.length, 3),
        target: 3,
        type: "item",
        completed: gameData.inventory.length >= 3,
        areaRequired: null,
        image: "treasure-hunt.png",
      },
      {
        id: 3,
        title: "อัพเกรดนักผจญภัย",
        description: "อัพเกรดนักผจญภัยให้ถึงระดับ " + (playerLevel + 2),
        reward: 150,
        progress: playerLevel,
        target: playerLevel + 2,
        type: "upgrade",
        completed: false,
        areaRequired: null,
        image: "upgrade-character.png",
      },
    ]

    setQuests(newQuests)
  }

  // อัพเดตความคืบหน้าของภารกิจ
  const updateQuestProgress = (questId: number, progress: number) => {
    setQuests((prevQuests) =>
      prevQuests.map((quest) =>
        quest.id === questId
          ? {
              ...quest,
              progress: Math.min(progress, quest.target),
              completed: progress >= quest.target,
            }
          : quest,
      ),
    )
  }

  // รับรางวัลจากภารกิจ
  const claimQuestReward = async (quest: any) => {
    if (isProcessing) return

    try {
      // อัพเดตสถานะภารกิจในฐานข้อมูล
      const result = await completeQuest(gameData.walletAddress, quest.id)

      if (result.success) {
        // แสดงรางวัล
        setQuestReward(quest.reward)
        setShowReward(true)

        // อัพเดตสถานะภารกิจในหน้าจอ
        updateQuestProgress(quest.id, quest.target)

        toast.success("ภารกิจสำเร็จ!", {
          description: `คุณได้รับ ${quest.reward} เหรียญ`,
        })
      } else {
        toast.error("เกิดข้อผิดพลาด", {
          description: result.error || "ไม่สามารถรับรางวัลได้",
        })
      }
    } catch (error) {
      console.error("Error claiming quest reward:", error)
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถรับรางวัลได้",
      })
    }
  }

  // รับรางวัลและปิดหน้าต่างรางวัล
  const handleClaimReward = () => {
    onQuestComplete(questReward)
    setShowReward(false)
    setActiveQuest(null)
  }

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-yellow-400" />
          <span>ภารกิจประจำวัน</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {showReward ? (
            <motion.div
              key="reward"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 10 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 1,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Gift className="h-10 w-10 text-yellow-400" />
                </div>
              </motion.div>

              <h3 className="text-xl font-bold mb-2">ภารกิจสำเร็จ!</h3>
              <p className="text-gray-300 mb-4">คุณได้รับรางวัล</p>

              <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full mb-6">
                <Coins className="h-5 w-5 text-yellow-400" />
                <span className="text-xl font-bold text-yellow-300">+{questReward}</span>
              </div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                  onClick={handleClaimReward}
                >
                  รับรางวัล
                </Button>
              </motion.div>
            </motion.div>
          ) : activeQuest ? (
            <motion.div
              key="quest-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{activeQuest.title}</h3>
                  <p className="text-sm text-gray-300">{activeQuest.description}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActiveQuest(null)}>
                  กลับ
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>ความคืบหน้า</span>
                  <span>
                    {activeQuest.progress}/{activeQuest.target}
                  </span>
                </div>
                <Progress value={(activeQuest.progress / activeQuest.target) * 100} className="h-2" />
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-yellow-400" />
                    <span>รางวัล:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span className="font-bold">{activeQuest.reward}</span>
                  </div>
                </div>
              </div>

              {activeQuest.areaRequired && (
                <div className="text-sm text-amber-300 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>ต้องอยู่ในพื้นที่: {activeQuest.areaRequired}</span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                  disabled={!activeQuest.completed || isProcessing}
                  onClick={() => claimQuestReward(activeQuest)}
                >
                  {activeQuest.completed ? "รับรางวัล" : "ยังไม่สำเร็จ"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quest-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {quests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">ไม่มีภารกิจในขณะนี้</p>
                </div>
              ) : (
                quests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 rounded-lg p-3 cursor-pointer border border-purple-500/20 hover:border-purple-500/50"
                    onClick={() => setActiveQuest(quest)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{quest.title}</h3>
                          {quest.completed && (
                            <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              สำเร็จ
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{quest.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400 text-sm">
                        <Coins className="h-3.5 w-3.5" />
                        <span>{quest.reward}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">ความคืบหน้า</span>
                        <span className="text-gray-400">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                      <Progress value={(quest.progress / quest.target) * 100} className="h-1.5" />
                    </div>
                    {/* Quest images - Available quests for player */}
                    <img
                      src={`/images/quests/${quest.image || "default-quest.png"}`}
                      alt={`Quest: ${quest.title}`}
                      className="w-full h-auto mt-2 rounded-md"
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

