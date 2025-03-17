"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Medal, Users, ArrowUp, ArrowDown, Sparkles, Crown } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface LeaderboardEntry {
  id: string
  rank: number
  name: string
  address: string
  avatar: string
  score: number
  level: number
  change: number // Positive for up, negative for down, 0 for no change
}

export default function Leaderboard() {
  const { t } = useI18n()
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("global")

  // Generate mock leaderboard data
  useEffect(() => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockData: LeaderboardEntry[] = [
        {
          id: "1",
          rank: 1,
          name: "CryptoWarrior",
          address: "0x1234...5678",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 9876,
          level: 42,
          change: 0,
        },
        {
          id: "2",
          rank: 2,
          name: "BlockchainHero",
          address: "0x2345...6789",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 8765,
          level: 38,
          change: 1,
        },
        {
          id: "3",
          rank: 3,
          name: "NFTCollector",
          address: "0x3456...7890",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 7654,
          level: 35,
          change: -1,
        },
        {
          id: "4",
          rank: 4,
          name: "MetaverseExplorer",
          address: "0x4567...8901",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 6543,
          level: 31,
          change: 2,
        },
        {
          id: "5",
          rank: 5,
          name: "TokenMaster",
          address: "0x5678...9012",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 5432,
          level: 29,
          change: 0,
        },
        {
          id: "6",
          rank: 6,
          name: "DeFiKing",
          address: "0x6789...0123",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 4321,
          level: 27,
          change: -2,
        },
        {
          id: "7",
          rank: 7,
          name: "GameFiChamp",
          address: "0x7890...1234",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 3210,
          level: 25,
          change: 1,
        },
        {
          id: "8",
          rank: 8,
          name: "Web3Pioneer",
          address: "0x8901...2345",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 2109,
          level: 22,
          change: 3,
        },
        {
          id: "9",
          rank: 9,
          name: "CryptoNinja",
          address: "0x9012...3456",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 1987,
          level: 20,
          change: -1,
        },
        {
          id: "10",
          rank: 10,
          name: "EtherWizard",
          address: "0x0123...4567",
          avatar: "/placeholder.svg?height=40&width=40",
          score: 1876,
          level: 18,
          change: 0,
        },
      ]

      setLeaderboardData(mockData)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Get rank badge color
  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-black"
      case 2:
        return "bg-gray-300 text-black"
      case 3:
        return "bg-amber-600 text-black"
      default:
        return "bg-purple-600"
    }
  }

  // Get rank icon
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4" />
      case 2:
        return <Medal className="h-4 w-4" />
      case 3:
        return <Trophy className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 bg-black/60 rounded-lg p-1 mb-4">
            <TabsTrigger
              value="global"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Global
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              Weekly
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-black/30 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-700/30"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700/30 rounded w-1/4 mb-2"></div>
                      <div className="h-3 bg-gray-700/30 rounded w-1/3"></div>
                    </div>
                    <div className="h-6 bg-gray-700/30 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboardData.map((entry) => (
                <motion.div key={entry.id} whileHover={{ scale: 1.02 }} className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${getRankBadgeColor(entry.rank)} flex items-center justify-center font-bold text-sm`}
                    >
                      {getRankIcon(entry.rank) || entry.rank}
                    </div>

                    <Avatar className="h-10 w-10 border-2 border-purple-500/50">
                      <AvatarImage src={entry.avatar} alt={entry.name} />
                      <AvatarFallback>{entry.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{entry.name}</h4>
                        {entry.rank <= 3 && (
                          <Sparkles
                            className={`h-4 w-4 ${
                              entry.rank === 1
                                ? "text-yellow-400"
                                : entry.rank === 2
                                  ? "text-gray-300"
                                  : "text-amber-600"
                            }`}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{entry.address}</p>
                    </div>

                    <div className="flex flex-col items-end">
                      <div className="font-bold">{entry.score.toLocaleString()}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">Lvl {entry.level}</span>
                        {entry.change !== 0 && (
                          <Badge
                            variant="outline"
                            className={`${
                              entry.change > 0
                                ? "bg-green-500/20 text-green-300 border-green-500"
                                : "bg-red-500/20 text-red-300 border-red-500"
                            } flex items-center gap-0.5 px-1.5 py-0`}
                          >
                            {entry.change > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                            {Math.abs(entry.change)}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="flex justify-center mt-4">
                <Button variant="outline" className="border-purple-500/30 hover:bg-purple-500/20">
                  <Users className="h-4 w-4 mr-2" />
                  View All Players
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

