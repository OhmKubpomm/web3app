"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { GAME_CONTRACT_ABI, GAME_CONTRACT_ADDRESS } from "@/lib/contracts/game-contract"
import { Sword, Swords, Skull, Loader2 } from "lucide-react"
import confetti from "canvas-confetti"

interface MonsterCardProps {
  id: number
  name: string
  level: number
  hp: number
  maxHp: number
  image: string
  onDefeat?: () => void
}

export default function MonsterCard({ id, name, level, hp, maxHp, image, onDefeat }: MonsterCardProps) {
  const { isConnected } = useAccount()
  const [attackCount, setAttackCount] = useState(5)

  // สร้าง contract write hook สำหรับการโจมตี
  const { writeContract, data: txHash, isPending, error } = useWriteContract()

  // รอการยืนยันธุรกรรม
  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // ฟังก์ชันเฉลิมฉลองเมื่อเอาชนะมอนสเตอร์
  const celebrateDefeat = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    toast.success(`ชัยชนะ! คุณได้เอาชนะ ${name} แล้ว!`)

    if (onDefeat) {
      onDefeat()
    }
  }

  // ฟังก์ชันจัดการการโจมตี
  const handleAttack = () => {
    if (!isConnected) {
      toast.error("ไม่ได้เชื่อมต่อกระเป๋าเงิน", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตี",
      })
      return
    }

    writeContract(
      {
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "attackMonster",
        args: [BigInt(id)],
      },
      {
        onSuccess(data) {
          toast.success("โจมตีสำเร็จ!", {
            description: "กำลังประมวลผลบน blockchain...",
          })
        },
        onError(error) {
          toast.error("เกิดข้อผิดพลาด", {
            description: error.message,
          })
        },
        onSettled(data, error) {
          if (isSuccess && !error) {
            // สมมติว่าเราได้รับค่า damage จาก event หรือ return value
            const damage = 10 // ในสถานการณ์จริงควรดึงจาก receipt

            toast.success("โจมตีสำเร็จ!", {
              description: `คุณสร้างความเสียหาย ${damage} แต้ม`,
            })

            // ตรวจสอบว่ามอนสเตอร์พ่ายแพ้หรือไม่
            if (hp - damage <= 0) {
              celebrateDefeat()
            }
          }
        },
      },
    )
  }

  // ฟังก์ชันจัดการการโจมตีหลายครั้ง
  const handleMultiAttack = () => {
    if (!isConnected) {
      toast.error("ไม่ได้เชื่อมต่อกระเป๋าเงิน", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตี",
      })
      return
    }

    writeContract(
      {
        address: GAME_CONTRACT_ADDRESS,
        abi: GAME_CONTRACT_ABI,
        functionName: "multiAttack",
        args: [BigInt(id), BigInt(attackCount)],
      },
      {
        onSuccess(data) {
          toast.success(`โจมตี ${attackCount} ครั้งสำเร็จ!`, {
            description: "กำลังประมวลผลบน blockchain...",
          })
        },
        onError(error) {
          toast.error("เกิดข้อผิดพลาด", {
            description: error.message,
          })
        },
        onSettled(data, error) {
          if (isSuccess && !error) {
            // สมมติว่าเราได้รับค่า totalDamage จาก event หรือ return value
            const totalDamage = 10 * attackCount // ในสถานการณ์จริงควรดึงจาก receipt

            toast.success("โจมตีหลายครั้งสำเร็จ!", {
              description: `คุณสร้างความเสียหายทั้งหมด ${totalDamage} แต้ม`,
            })

            // ตรวจสอบว่ามอนสเตอร์พ่ายแพ้หรือไม่
            if (hp - totalDamage <= 0) {
              celebrateDefeat()
            }
          }
        },
      },
    )
  }

  // คำนวณเปอร์เซ็นต์ HP
  const hpPercentage = (hp / maxHp) * 100

  // กำหนดสีของแถบ HP ตามเปอร์เซ็นต์
  const getHpColor = () => {
    if (hpPercentage <= 20) return "bg-red-500"
    if (hpPercentage <= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  // กำลังโหลดหรือไม่
  const isLoading = isPending || isConfirming

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden border-2 border-primary/20 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-0">
        <div className="relative">
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-md">
            <Skull className="h-4 w-4" />
            <span>Lv.{level}</span>
          </div>

          <div className="relative h-64 w-full">
            <Image
              src={image || "/placeholder.svg?height=256&width=384"}
              alt={name}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-white text-sm">
                HP: {hp}/{maxHp}
              </span>
              <Progress value={hpPercentage} className="h-2" />
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4 bg-card">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">จำนวนการโจมตี: {attackCount}</span>
            </div>
            <Slider
              value={[attackCount]}
              min={1}
              max={20}
              step={1}
              onValueChange={(value) => setAttackCount(value[0])}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleAttack} disabled={isLoading} className="w-full" variant="outline">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sword className="h-4 w-4 mr-2" />}
              โจมตี 1 ครั้ง
            </Button>

            <Button onClick={handleMultiAttack} disabled={isLoading} className="w-full" variant="default">
              {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Swords className="h-4 w-4 mr-2" />}
              โจมตี {attackCount} ครั้ง
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>* การโจมตีจะทำธุรกรรมบน blockchain และอาจมีค่าแก๊ส</p>
            <p>* โจมตีหลายครั้งจะประหยัดค่าแก๊สมากกว่าการโจมตีทีละครั้ง</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

