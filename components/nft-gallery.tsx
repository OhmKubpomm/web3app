"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeb3 } from "@/lib/web3-client"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n"
import { ImageIcon, Search, X, ExternalLink, Sparkles, RefreshCw, Filter } from "lucide-react"

interface NFT {
  id: string
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string
  }[]
  type: string
  rarity: string
}

export default function NFTGallery({ gameData }: { gameData: any }) {
  const { address, chainId } = useWeb3()
  const { t } = useI18n()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  // สร้าง NFT จำลองจากคลังไอเทมในเกม
  const generateNFTs = () => {
    if (!gameData?.inventory) return []

    return gameData.inventory.map((item: any, index: number) => {
      // สร้างคุณสมบัติแบบสุ่มตามประเภทและความหายากของไอเทม
      const attributes = []

      if (item.type === "weapon") {
        attributes.push(
          { trait_type: "ความเสียหาย", value: `${Math.floor(Math.random() * 50) + 10}` },
          { trait_type: "ความเร็ว", value: `${Math.floor(Math.random() * 10) + 1}` },
        )
      } else if (item.type === "armor") {
        attributes.push(
          { trait_type: "การป้องกัน", value: `${Math.floor(Math.random() * 40) + 5}` },
          { trait_type: "น้ำหนัก", value: `${Math.floor(Math.random() * 10) + 1}` },
        )
      } else if (item.type === "accessory") {
        attributes.push(
          { trait_type: "โชค", value: `${Math.floor(Math.random() * 20) + 1}` },
          { trait_type: "เวทมนตร์", value: `${Math.floor(Math.random() * 30) + 5}` },
        )
      }

      // เพิ่มคุณสมบัติความหายาก
      attributes.push({ trait_type: "ความหายาก", value: item.rarity })

      return {
        id: item.tokenId || `nft-${index}`,
        name: item.name,
        description: item.description,
        image: item.image || "/placeholder.svg?height=300&width=300",
        attributes,
        type: item.type,
        rarity: item.rarity,
      }
    })
  }

  // โหลด NFT เมื่อโหลดและเมื่อข้อมูลเกมเปลี่ยนแปลง
  useEffect(() => {
    if (gameData) {
      setIsLoading(true)

      // จำลองการเรียก API
      setTimeout(() => {
        const generatedNfts = generateNFTs()
        setNfts(generatedNfts)
        setIsLoading(false)
      }, 1000)
    }
  }, [gameData])

  // กรอง NFT ตามคำค้นหา, แท็บ และตัวกรอง
  const filteredNfts = nfts.filter((nft) => {
    // ตัวกรองการค้นหา
    const matchesSearch =
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.rarity.toLowerCase().includes(searchQuery.toLowerCase())

    // ตัวกรองแท็บ
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "weapons" && nft.type === "weapon") ||
      (activeTab === "armor" && nft.type === "armor") ||
      (activeTab === "accessories" && nft.type === "accessory")

    // ตัวกรองความหายาก
    const matchesFilter = !activeFilter || nft.rarity.toLowerCase() === activeFilter.toLowerCase()

    return matchesSearch && matchesTab && matchesFilter
  })

  // รับสีความหายาก
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "common":
        return "bg-gray-500"
      case "uncommon":
        return "bg-green-500"
      case "rare":
        return "bg-blue-500"
      case "epic":
        return "bg-purple-500"
      case "legendary":
        return "bg-orange-500"
      default:
        return "bg-gray-500"
    }
  }

  // รับ URL ของ Explorer ตาม Chain ID
  const getExplorerUrl = (chainId: number | null) => {
    if (!chainId) return "https://etherscan.io"

    const explorers: Record<number, string> = {
      1: "https://etherscan.io",
      137: "https://polygonscan.com",
      80001: "https://mumbai.polygonscan.com",
      11155111: "https://sepolia.etherscan.io",
    }

    return explorers[chainId] || "https://etherscan.io"
  }

  // จัดการการเลือก NFT
  const handleSelectNft = (nft: NFT) => {
    setSelectedNft(nft)
  }

  // จัดการการปิดรายละเอียด NFT
  const handleCloseDetails = () => {
    setSelectedNft(null)
  }

  // จัดการการรีเฟรช
  const handleRefresh = () => {
    setIsLoading(true)

    // จำลองการเรียก API
    setTimeout(() => {
      const generatedNfts = generateNFTs()
      setNfts(generatedNfts)
      setIsLoading(false)

      toast.success("รีเฟรชแล้ว", {
        description: "แกลเลอรี NFT ได้รับการรีเฟรชแล้ว",
      })
    }, 1000)
  }

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <span>แกลเลอรี NFT</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-purple-500/30"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">รีเฟรช</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {selectedNft ? (
            <motion.div
              key="nft-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{selectedNft.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`${getRarityColor(selectedNft.rarity)}`}>{selectedNft.rarity}</Badge>
                    <Badge variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                      {selectedNft.type}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={handleCloseDetails}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-lg border-2 border-purple-500/50">
                <img
                  src={selectedNft.image || "/placeholder.svg"}
                  alt={selectedNft.name}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 right-2">
                  <Badge className={`${getRarityColor(selectedNft.rarity)}`}>{selectedNft.rarity}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">คำอธิบาย</h4>
                  <p className="text-sm">{selectedNft.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-2">คุณสมบัติ</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNft.attributes.map((attr, index) => (
                      <div key={index} className="bg-black/30 p-2 rounded-md">
                        <div className="text-xs text-gray-400">{attr.trait_type}</div>
                        <div className="font-medium">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedNft.id && selectedNft.id.startsWith("0x") && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">Token ID</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-mono bg-black/30 p-2 rounded overflow-x-auto">{selectedNft.id}</p>
                      <a
                        href={`${getExplorerUrl(chainId)}/token/${selectedNft.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 ml-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="outline" onClick={handleCloseDetails}>
                  กลับไปยังแกลเลอรี
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="nft-gallery"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหา NFT..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-black/30 border-purple-500/30"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 justify-between">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="grid grid-cols-4 bg-black/60 rounded-lg p-1">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md text-xs"
                      >
                        ทั้งหมด
                      </TabsTrigger>
                      <TabsTrigger
                        value="weapons"
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md text-xs"
                      >
                        อาวุธ
                      </TabsTrigger>
                      <TabsTrigger
                        value="armor"
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md text-xs"
                      >
                        เกราะ
                      </TabsTrigger>
                      <TabsTrigger
                        value="accessories"
                        className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md text-xs"
                      >
                        เครื่องประดับ
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <div className="flex gap-1">
                      {["common", "uncommon", "rare", "epic", "legendary"].map((rarity) => (
                        <Button
                          key={rarity}
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2 text-xs ${
                            activeFilter === rarity
                              ? `${getRarityColor(rarity)} text-white border-transparent`
                              : "bg-black/30 border-gray-700"
                          }`}
                          onClick={() => setActiveFilter(activeFilter === rarity ? null : rarity)}
                        >
                          {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-black/30 rounded-lg p-4 h-64 animate-pulse">
                      <div className="w-full h-40 bg-gray-700/30 rounded-md mb-4"></div>
                      <div className="h-4 bg-gray-700/30 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredNfts.length === 0 ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">ไม่พบ NFT</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {searchQuery || activeFilter || activeTab !== "all"
                      ? "ลองปรับการค้นหาหรือตัวกรองของคุณ"
                      : "ต่อสู้กับมอนสเตอร์เพื่อรับไอเทม NFT ที่สามารถเก็บบนบล็อกเชน"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNfts.map((nft) => (
                    <motion.div
                      key={nft.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      className="cursor-pointer"
                      onClick={() => handleSelectNft(nft)}
                    >
                      <div className="bg-black/30 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                        <div className="relative aspect-video">
                          <img
                            src={nft.image || "/placeholder.svg"}
                            alt={nft.name}
                            className="object-cover w-full h-full"
                          />
                          <div className="absolute top-2 right-2">
                            <Badge className={`${getRarityColor(nft.rarity)}`}>{nft.rarity}</Badge>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-bold mb-1">{nft.name}</h3>
                          <p className="text-xs text-gray-400 line-clamp-2">{nft.description}</p>
                          <div className="flex justify-between items-center mt-2">
                            <Badge variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                              {nft.type}
                            </Badge>
                            {nft.id.startsWith("0x") && <span className="text-xs text-purple-400">บนบล็อกเชน</span>}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

