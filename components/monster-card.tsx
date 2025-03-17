"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sword, Skull, Coins } from "lucide-react"
import { toast } from "sonner"
import { updateCoins, recordBattle } from "@/lib/actions"

interface MonsterCardProps {
  gameData: any
  onDefeat: (reward: number) => void
  isProcessing: boolean
}

// ข้อมูลมอนสเตอร์ตามพื้นที่
const MONSTERS = {
  ป่า: [
    { name: "สไลม์", hp: 10, reward: 1, color: "green" },
    { name: "หมาป่า", hp: 15, reward: 2, color: "gray" },
    { name: "งูยักษ์", hp: 20, reward: 3, color: "purple" },
  ],
  ถ้ำ: [
    { name: "ค้างคาวยักษ์", hp: 30, reward: 4, color: "black" },
    { name: "โกเล็ม", hp: 50, reward: 6, color: "brown" },
    { name: "แมงมุมพิษ", hp: 40, reward: 5, color: "red" },
  ],
  ทะเลทราย: [
    { name: "แมงป่องยักษ์", hp: 60, reward: 7, color: "yellow" },
    { name: "มัมมี่", hp: 70, reward: 8, color: "beige" },
    { name: "จิ้งจอกทะเลทราย", hp: 65, reward: 7, color: "orange" },
  ],
  ภูเขาไฟ: [
    { name: "มังกรไฟ", hp: 100, reward: 12, color: "red" },
    { name: "อสูรหิน", hp: 90, reward: 10, color: "gray" },
    { name: "ปีศาจลาวา", hp: 85, reward: 9, color: "orange" },
  ],
}

export default function MonsterCard({ gameData, onDefeat, isProcessing }: MonsterCardProps) {
  const [currentMonster, setCurrentMonster] = useState<any>(null)
  const [monsterHP, setMonsterHP] = useState(0)
  const [maxHP, setMaxHP] = useState(0)
  const [isAttacking, setIsAttacking] = useState(false)
  const [showDamage, setShowDamage] = useState(false)
  const [damageValue, setDamageValue] = useState(0)
  const [showReward, setShowReward] = useState(false)
  const [rewardValue, setRewardValue] = useState(0)
  const [isAutoAttacking, setIsAutoAttacking] = useState(false)
  const [autoAttackInterval, setAutoAttackInterval] = useState<NodeJS.Timeout | null>(null)

  // สุ่มมอนสเตอร์ตามพื้นที่
  const spawnMonster = () => {
    const area = gameData?.currentArea || "ป่า"
    const areaMonsters = MONSTERS[area as keyof typeof MONSTERS] || MONSTERS["ป่า"]
    const randomIndex = Math.floor(Math.random() * areaMonsters.length)
    const monster = { ...areaMonsters[randomIndex] }

    // ปรับความยากตามเลเวลของผู้เล่น
    const playerLevel = Math.max(...(gameData?.characters?.map((c: any) => c.level) || [1]))
    const areaMultiplier = area === "ป่า" ? 1 : area === "ถ้ำ" ? 2 : area === "ทะเลทราย" ? 3 : area === "ภูเขาไฟ" ? 4 : 1

    monster.hp = Math.floor(monster.hp * (1 + (playerLevel - 1) * 0.2) * areaMultiplier)
    monster.reward = Math.floor(monster.reward * (1 + (playerLevel - 1) * 0.1) * areaMultiplier)

    setCurrentMonster(monster)
    setMonsterHP(monster.hp)
    setMaxHP(monster.hp)
    setShowReward(false)
  }

  // โจมตีมอนสเตอร์
  const attackMonster = async () => {
    if (isAttacking || isProcessing || monsterHP <= 0) return

    setIsAttacking(true)

    // คำนวณดาเมจ
    const damage = gameData?.damage || 1
    setDamageValue(damage)
    setShowDamage(true)

    // ลด HP มอนสเตอร์
    const newHP = Math.max(0, monsterHP - damage)
    setMonsterHP(newHP)

    // เช็คว่ามอนสเตอร์ตายหรือไม่
    if (newHP <= 0) {
      // บันทึกการต่อสู้
      try {
        await recordBattle(gameData.walletAddress, {
          monstersDefeated: 1,
          coinsEarned: currentMonster.reward,
          itemsFound: 0,
        })
      } catch (error) {
        console.error("Error recording battle:", error)
      }

      // แสดงรางวัล
      setRewardValue(currentMonster.reward)
      setShowReward(true)

      // อัพเดตเหรียญ
      try {
        const result = await updateCoins(gameData.walletAddress, currentMonster.reward)

        if (result.success) {
          onDefeat(currentMonster.reward)
        } else {
          toast.error("ไม่สามารถรับรางวัลได้", {
            description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          })
        }
      } catch (error) {
        console.error("Error updating coins:", error)
      }

      // รีเซ็ตหลังจาก 2 วินาที
      setTimeout(() => {
        spawnMonster()
      }, 2000)
    }

    // ซ่อนดาเมจหลังจาก 1 วินาที
    setTimeout(() => {
      setShowDamage(false)
      setIsAttacking(false)
    }, 1000)
  }

  // โจมตีอัตโนมัติ
  useEffect(() => {
    if (gameData?.autoDamage && gameData.autoDamage > 0) {
      if (autoAttackInterval) {
        clearInterval(autoAttackInterval)
      }

      const interval = setInterval(() => {
        if (monsterHP > 0 && !isProcessing) {
          setIsAutoAttacking(true)

          // คำนวณดาเมจอัตโนมัติ
          const autoDamage = gameData.autoDamage

          // ลด HP มอนสเตอร์
          const newHP = Math.max(0, monsterHP - autoDamage)
          setMonsterHP(newHP)

          // เช็คว่ามอนสเตอร์ตายหรือไม่
          if (newHP <= 0) {
            // บันทึกการต่อสู้
            recordBattle(gameData.walletAddress, {
              monstersDefeated: 1,
              coinsEarned: currentMonster.reward,
              itemsFound: 0,
            }).catch(console.error)

            // แสดงรางวัล
            setRewardValue(currentMonster.reward)
            setShowReward(true)

            // อัพเดตเหรียญ
            updateCoins(gameData.walletAddress, currentMonster.reward)
              .then((result) => {
                if (result.success) {
                  onDefeat(currentMonster.reward)
                }
              })
              .catch(console.error)

            // รีเซ็ตหลังจาก 2 วินาที
            setTimeout(() => {
              spawnMonster()
            }, 2000)
          }

          setIsAutoAttacking(false)
        }
      }, 1000)

      setAutoAttackInterval(interval)

      return () => {
        clearInterval(interval)
      }
    }
  }, [gameData?.autoDamage, monsterHP, currentMonster, isProcessing])

  // สร้างมอนสเตอร์เมื่อเริ่มต้น
  useEffect(() => {
    spawnMonster()

    return () => {
      if (autoAttackInterval) {
        clearInterval(autoAttackInterval)
      }
    }
  }, [gameData?.currentArea])

  // สร้างสีตามประเภทมอนสเตอร์
  const getMonsterColor = () => {
    if (!currentMonster) return "bg-purple-600"

    switch (currentMonster.color) {
      case "green":
        return "bg-green-600"
      case "gray":
        return "bg-gray-600"
      case "purple":
        return "bg-purple-600"
      case "black":
        return "bg-gray-800"
      case "brown":
        return "bg-amber-800"
      case "red":
        return "bg-red-600"
      case "yellow":
        return "bg-yellow-600"
      case "beige":
        return "bg-amber-300"
      case "orange":
        return "bg-orange-600"
      default:
        return "bg-purple-600"
    }
  }

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold">{currentMonster?.name || "มอนสเตอร์"}</h2>
          <div className="text-sm text-gray-400">พื้นที่: {gameData?.currentArea || "ป่า"}</div>
        </div>

        <div className="relative h-60 flex items-center justify-center mb-4">
          {/* Magic UI: แทนรูปภาพด้วย Animation */}
          <div className="relative w-40 h-40 cursor-pointer" onClick={attackMonster}>
            {/* พื้นหลังมอนสเตอร์ */}
            <motion.div
              animate={{
                scale: isAttacking ? 0.95 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`absolute inset-0 rounded-full ${getMonsterColor()} flex items-center justify-center`}
            >
              {/* ไอคอนมอนสเตอร์ */}
              <Skull className="h-16 w-16 text-white" />

              {/* เอฟเฟกต์เมื่อโจมตี */}
              <AnimatePresence>
                {showDamage && (
                  <motion.div
                    initial={{ opacity: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: 1, y: -30, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute text-red-400 font-bold text-xl"
                  >
                    -{damageValue}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* เอฟเฟกต์โจมตีอัตโนมัติ */}
            {isAutoAttacking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-4"
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: Math.cos((i * Math.PI) / 4) * 60,
                      y: Math.sin((i * Math.PI) / 4) * 60,
                      opacity: 0,
                    }}
                    animate={{
                      x: 0,
                      y: 0,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.5,
                    }}
                    className="absolute w-2 h-8 bg-blue-400 rounded-full"
                    style={{
                      top: "50%",
                      left: "50%",
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg)`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>

          {/* แสดงรางวัล */}
          <AnimatePresence>
            {showReward && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg"
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">ชัยชนะ!</h3>
                  <div className="flex items-center justify-center gap-2 bg-black/30 px-4 py-2 rounded-full">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    <span className="text-xl font-bold text-yellow-300">+{rewardValue}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>HP</span>
            <span>
              {monsterHP}/{maxHP}
            </span>
          </div>
          <Progress value={(monsterHP / maxHP) * 100} className="h-2" />

          <div className="flex justify-between text-sm mt-2">
            <div className="flex items-center gap-1">
              <Sword className="h-4 w-4 text-red-400" />
              <span>โจมตี</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span>รางวัล: {currentMonster?.reward || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

