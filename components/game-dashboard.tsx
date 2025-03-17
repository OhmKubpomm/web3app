"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import GameHeader from "@/components/game-header"
import MonsterCard from "@/components/monster-card"
import CharacterCard from "@/components/character-card"
import QuestSystem from "@/components/quest-system"
import AreaSelector from "@/components/area-selector"
import NFTInventory from "@/components/nft-inventory"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { buyCharacter } from "@/lib/actions"

interface GameDashboardProps {
  initialGameData: any
}

export default function GameDashboard({ initialGameData }: GameDashboardProps) {
  const [gameData, setGameData] = useState(initialGameData)
  const [isProcessing, setIsProcessing] = useState(false)

  // ฟังก์ชันอัพเดตเหรียญ
  const handleCoinsUpdate = (amount: number) => {
    setGameData((prev: any) => ({
      ...prev,
      coins: prev.coins + amount,
    }))
  }

  // ฟังก์ชันอัพเดตข้อมูลเกม
  const handleGameDataUpdate = (updatedData: any) => {
    setGameData(updatedData)
  }

  // ฟังก์ชันซื้อตัวละครใหม่
  const handleBuyCharacter = async () => {
    if (isProcessing) return

    // คำนวณราคาตัวละครใหม่
    const characterCost = (gameData.characters?.length || 0) * 100 + 100

    if (gameData.coins < characterCost) {
      toast.error("เหรียญไม่เพียงพอ", {
        description: `ต้องการ ${characterCost} เหรียญ`,
      })
      return
    }

    setIsProcessing(true)

    try {
      const result = await buyCharacter(gameData.walletAddress, characterCost)

      if (result.success) {
        toast.success("ซื้อตัวละครสำเร็จ", {
          description: "คุณได้รับนักผจญภัยคนใหม่แล้ว!",
        })
        setGameData(result.data)
      } else {
        toast.error("ซื้อตัวละครล้มเหลว", {
          description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        })
      }
    } catch (error) {
      console.error("Error buying character:", error)
      toast.error("ซื้อตัวละครล้มเหลว", {
        description: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <GameHeader gameData={gameData} />

      <main className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* คอลัมน์ซ้าย */}
          <div className="space-y-6">
            <MonsterCard gameData={gameData} onDefeat={handleCoinsUpdate} isProcessing={isProcessing} />
            <AreaSelector gameData={gameData} onAreaChange={handleGameDataUpdate} isProcessing={isProcessing} />
          </div>

          {/* คอลัมน์กลาง */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {gameData.characters?.map((character: any) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  gameData={gameData}
                  onUpgrade={handleGameDataUpdate}
                  isProcessing={isProcessing}
                />
              ))}
              <motion.div whileHover={{ scale: 1.02 }}>
                <Button
                  onClick={handleBuyCharacter}
                  disabled={isProcessing}
                  className="h-full w-full bg-black/40 border border-dashed border-purple-500/30 hover:bg-black/60 hover:border-purple-500/50"
                >
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-purple-900/30 rounded-full p-3 mb-2">
                      <Plus className="h-6 w-6 text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">จ้างนักผจญภัย</span>
                    <span className="text-xs text-gray-400 mt-1">
                      {(gameData.characters?.length || 0) * 100 + 100} เหรียญ
                    </span>
                  </div>
                </Button>
              </motion.div>
            </div>
            <QuestSystem gameData={gameData} onQuestComplete={handleCoinsUpdate} isProcessing={isProcessing} />
          </div>

          {/* คอลัมน์ขวา */}
          <div className="space-y-6">
            <NFTInventory gameData={gameData} onReceiveNFT={handleGameDataUpdate} isProcessing={isProcessing} />
          </div>
        </div>
      </main>
    </div>
  )
}

