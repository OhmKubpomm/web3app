"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, ChartContainer, ChartBars, ChartBar } from "@/components/ui/chart"
import { Activity, Sword, Coins, Clock, Trophy } from "lucide-react"

interface StatsPanelProps {
  gameData: any
  battleStats?: {
    monstersDefeated: number
    coinsEarned: number
    itemsFound: number
  }
}

export default function StatsPanel({ gameData, battleStats }: StatsPanelProps) {
  // คำนวณเวลาเล่นเกม (จำลอง)
  const calculatePlayTime = () => {
    const now = new Date()
    const lastSaved = gameData.lastSaved ? new Date(gameData.lastSaved) : now
    const diffInMinutes = Math.floor((now.getTime() - lastSaved.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} นาที`
    } else if (diffInMinutes < 60 * 24) {
      return `${Math.floor(diffInMinutes / 60)} ชั่วโมง ${diffInMinutes % 60} นาที`
    } else {
      return `${Math.floor(diffInMinutes / (60 * 24))} วัน ${Math.floor((diffInMinutes % (60 * 24)) / 60)} ชั่วโมง`
    }
  }

  // ข้อมูลสถิติ
  const stats = [
    {
      name: "พลังโจมตี",
      value: (gameData.damage * (gameData.upgrades?.damageMultiplier || 1)).toFixed(1),
      color: "bg-red-500",
      icon: <Sword className="h-4 w-4 text-red-400" />,
    },
    {
      name: "พลังอัตโนมัติ",
      value: gameData.autoDamage.toFixed(1) + "/วิ",
      color: "bg-blue-500",
      icon: <Activity className="h-4 w-4 text-blue-400" />,
    },
    {
      name: "เหรียญทั้งหมด",
      value: gameData.coins,
      color: "bg-yellow-500",
      icon: <Coins className="h-4 w-4 text-yellow-400" />,
    },
    {
      name: "เวลาเล่น",
      value: calculatePlayTime(),
      color: "bg-purple-500",
      icon: <Clock className="h-4 w-4 text-purple-400" />,
    },
  ]

  // ข้อมูลสถิติการต่อสู้ในเซสชันปัจจุบัน
  const sessionStats = [
    {
      name: "มอนสเตอร์ที่สังหาร",
      value: battleStats?.monstersDefeated || 0,
      color: "bg-red-500",
    },
    {
      name: "เหรียญที่ได้รับ",
      value: battleStats?.coinsEarned || 0,
      color: "bg-yellow-500",
    },
    {
      name: "ไอเทมที่พบ",
      value: battleStats?.itemsFound || 0,
      color: "bg-purple-500",
    },
  ]

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>สถิติการเล่น</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-black/30 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                {stat.icon}
                <span className="text-sm text-gray-300">{stat.name}</span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-black/30 p-3 rounded-lg mb-4">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-purple-400" />
            สถิติเซสชันปัจจุบัน
          </h3>

          <div className="space-y-3">
            {sessionStats.map((stat, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-400">{stat.name}</span>
                  <Badge variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                    {stat.value}
                  </Badge>
                </div>
                <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${stat.color} rounded-full`}
                    style={{
                      width: `${Math.min(100, (stat.value / (index === 0 ? 100 : index === 1 ? 1000 : 10)) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-black/30 p-3 rounded-lg">
          <h3 className="text-sm font-medium mb-3">ความก้าวหน้า</h3>

          <ChartContainer className="h-20">
            <BarChart
              data={[
                { name: "พลังโจมตี", value: gameData.damage * (gameData.upgrades?.damageMultiplier || 1) },
                { name: "ตัวละคร", value: gameData.characters.length * 10 },
                { name: "ไอเทม", value: gameData.inventory.length * 5 },
                {
                  name: "อัพเกรด",
                  value:
                    (gameData.upgrades?.autoBattle ? 10 : 0) +
                    gameData.upgrades?.inventorySlots / 2 +
                    gameData.upgrades?.damageMultiplier * 5,
                },
              ]}
            >
              <ChartBars>
                {({ data }) =>
                  data.map((d, i) => (
                    <ChartBar
                      key={i}
                      value={d.value}
                      className={
                        i === 0
                          ? "fill-red-500"
                          : i === 1
                            ? "fill-blue-500"
                            : i === 2
                              ? "fill-purple-500"
                              : "fill-yellow-500"
                      }
                    />
                  ))
                }
              </ChartBars>
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

