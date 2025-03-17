"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Coins } from "lucide-react"

interface NFTPanelProps {
  gameData: any
  onMintNFT: (item: any) => void
  isProcessing: boolean
}

export default function NFTPanel({ gameData, onMintNFT, isProcessing }: NFTPanelProps) {
  // สร้างไอเทม NFT สำหรับซื้อ
  const nftItems = [
    {
      name: "ดาบนักรบ",
      description: "เพิ่มพลังโจมตี 10%",
      type: "weapon",
      rarity: "uncommon",
      image: "/placeholder.svg?height=80&width=80",
      cost: 200,
    },
    {
      name: "โล่มังกร",
      description: "เพิ่มความทนทาน 15%",
      type: "shield",
      rarity: "rare",
      image: "/placeholder.svg?height=80&width=80",
      cost: 500,
    },
  ]

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          NFT พิเศษ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {nftItems.map((item, index) => (
          <motion.div key={index} whileHover={{ scale: 1.02 }}>
            <Card className="bg-black/30 border-purple-500/30">
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Badge
                      className={`absolute -top-2 -right-2 ${
                        item.rarity === "common"
                          ? "bg-gray-500"
                          : item.rarity === "uncommon"
                            ? "bg-green-500"
                            : item.rarity === "rare"
                              ? "bg-blue-500"
                              : "bg-purple-500"
                      }`}
                    >
                      {item.rarity}
                    </Badge>
                    <div className="w-12 h-12 bg-purple-900/30 rounded-md flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-purple-400" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-xs text-gray-400">{item.description}</p>
                  </div>
                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 border-purple-500/50"
                      disabled={gameData.coins < item.cost || isProcessing}
                      onClick={() => onMintNFT(item)}
                    >
                      <Coins className="h-3 w-3 text-yellow-400" />
                      <span>{item.cost}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <div className="mt-2 p-3 bg-black/30 rounded-md text-xs text-gray-400">
          <p>NFT ที่ซื้อจะถูกสร้างบนบล็อกเชนและเป็นของคุณตลอดไป สามารถซื้อขายในตลาด NFT ได้</p>
        </div>
      </CardContent>
    </Card>
  )
}

