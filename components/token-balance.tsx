"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWeb3 } from "@/lib/web3-client"
import { toast } from "sonner"
import { Coins, TrendingUp, RefreshCw, ArrowUpRight, Clock } from "lucide-react"

// ข้อมูลโทเค็นจำลอง
const GAME_TOKENS = [
  {
    symbol: "ADVT",
    name: "Adventure Token",
    balance: 0,
    decimals: 18,
    address: "0x1234567890123456789012345678901234567890",
    price: 0.05,
    change: 2.5,
    color: "from-purple-500 to-pink-500",
  },
  {
    symbol: "GOLD",
    name: "Gold Coin",
    balance: 0,
    decimals: 18,
    address: "0x0987654321098765432109876543210987654321",
    price: 0.02,
    change: -1.2,
    color: "from-yellow-500 to-amber-500",
  },
]

export default function TokenBalance() {
  const { address } = useWeb3()
  const [tokens, setTokens] = useState(GAME_TOKENS)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // ดึงข้อมูลยอดคงเหลือของโทเค็น
  const fetchTokenBalances = async () => {
    if (!address || typeof window === "undefined" || !window.ethereum) return

    setIsLoading(true)

    try {
      // ในแอปจริง คุณจะดึงยอดคงเหลือจริงจากบล็อกเชน
      // สำหรับการสาธิตนี้ เราจะสร้างยอดคงเหลือแบบสุ่ม
      const updatedTokens = tokens.map((token) => ({
        ...token,
        balance: Number.parseFloat((Math.random() * 1000).toFixed(2)),
        price: token.price * (1 + (Math.random() * 0.1 - 0.05)), // การเปลี่ยนแปลงราคาแบบสุ่ม ±5%
        change: Number.parseFloat((Math.random() * 10 - 5).toFixed(2)), // การเปลี่ยนแปลงแบบสุ่มระหว่าง -5% และ +5%
      }))

      setTokens(updatedTokens)
      setLastUpdated(new Date())

      toast.success("อัพเดตยอดคงเหลือแล้ว", {
        description: "ยอดคงเหลือของโทเค็นได้รับการรีเฟรชแล้ว",
      })
    } catch (error) {
      console.error("Error fetching token balances:", error)
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถดึงยอดคงเหลือของโทเค็นได้",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // ดึงยอดคงเหลือเมื่อโหลด
  useEffect(() => {
    if (address) {
      fetchTokenBalances()
    }
  }, [address])

  // คำนวณมูลค่ารวมในสกุลเงิน USD
  const totalValue = tokens.reduce((total, token) => {
    return total + token.balance * token.price
  }, 0)

  if (!address) {
    return (
      <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Coins className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-300">เชื่อมต่อกระเป๋าเงินของคุณเพื่อดูยอดคงเหลือของโทเค็น</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span>โทเค็นในเกม</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-purple-500/30"
            onClick={fetchTokenBalances}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">รีเฟรช</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-400 mb-2">มูลค่ารวม</h3>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${totalValue.toFixed(2)}</span>
              <Badge
                variant="outline"
                className={`${
                  totalValue > 50
                    ? "bg-green-500/20 text-green-300 border-green-500"
                    : "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                }`}
              >
                {totalValue > 50 ? "สูง" : "ปานกลาง"}
              </Badge>
            </div>

            {lastUpdated && (
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>อัพเดตล่าสุด: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {tokens.map((token) => (
              <div key={token.symbol} className="bg-black/30 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${token.color} flex items-center justify-center text-white font-bold text-xs`}
                    >
                      {token.symbol}
                    </div>
                    <div>
                      <h4 className="font-medium">{token.name}</h4>
                      <p className="text-xs text-gray-400">{token.symbol}</p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      token.change >= 0
                        ? "bg-green-500/20 text-green-300 border-green-500"
                        : "bg-red-500/20 text-red-300 border-red-500"
                    } flex items-center gap-1`}
                  >
                    {token.change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <ArrowUpRight className="h-3 w-3 rotate-90" />
                    )}
                    {token.change >= 0 ? "+" : ""}
                    {token.change}%
                  </Badge>
                </div>

                <div className="flex justify-between items-center mb-1">
                  <span className="text-lg font-bold">{token.balance.toLocaleString()}</span>
                  <span className="text-sm text-gray-300">${(token.balance * token.price).toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">ราคา</span>
                  <span>${token.price.toFixed(4)}</span>
                </div>

                <Progress value={(token.balance / 1000) * 100} className="h-1" />
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            className="w-full border-purple-500/30 hover:bg-purple-500/20"
            onClick={() => {
              toast.info("เร็วๆ นี้", {
                description: "ฟังก์ชันการแลกเปลี่ยนโทเค็นจะมีให้ใช้งานเร็วๆ นี้!",
              })
            }}
          >
            แลกเปลี่ยนโทเค็น
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

