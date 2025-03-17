"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Package, Sparkles, ExternalLink, X } from "lucide-react"
import { toast } from "sonner"
import { useWeb3 } from "@/lib/web3-client"
import { receiveNFTItem } from "@/lib/actions"

interface NFTInventoryProps {
  gameData: any
  onReceiveNFT: (updatedData: any) => void
  isProcessing: boolean
}

// ประเภทของไอเทม
const ITEM_TYPES = [
  { id: "all", name: "ทั้งหมด" },
  { id: "weapon", name: "อาวุธ" },
  { id: "armor", name: "เกราะ" },
  { id: "accessory", name: "อุปกรณ์เสริม" },
  { id: "special", name: "พิเศษ" },
]

// ระดับความหายาก
const RARITIES = {
  common: { name: "ธรรมดา", color: "bg-gray-500" },
  uncommon: { name: "ไม่ธรรมดา", color: "bg-green-500" },
  rare: { name: "หายาก", color: "bg-blue-500" },
  epic: { name: "มหากาพย์", color: "bg-purple-500" },
  legendary: { name: "ตำนาน", color: "bg-orange-500" },
}

export default function NFTInventory({ gameData, onReceiveNFT, isProcessing }: NFTInventoryProps) {
  const { mintNFT } = useWeb3()
  const [activeTab, setActiveTab] = useState("inventory")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [isMinting, setIsMinting] = useState(false)

  // กรองไอเทมตามประเภท
  const filteredItems =
    gameData?.inventory?.filter((item: any) => {
      if (selectedType === "all") return true
      return item.type === selectedType
    }) || []

  // ฟังก์ชันสร้าง NFT
  const handleMintNFT = async () => {
    if (isProcessing || isMinting) return

    setIsMinting(true)

    try {
      // สร้างข้อมูล metadata สำหรับ NFT
      const metadata = {
        name: `Adventure Item #${Date.now()}`,
        description: "A unique item from Adventure Clicker game",
        image: "https://example.com/placeholder.png", // ควรใช้ IPFS หรือ Arweave ในการเก็บรูปภาพจริง
        attributes: [
          { trait_type: "Type", value: "weapon" },
          { trait_type: "Rarity", value: "uncommon" },
          { trait_type: "Power", value: 5 },
        ],
      }

      // สร้าง NFT บน blockchain
      const tokenId = await mintNFT(JSON.stringify(metadata))

      if (tokenId) {
        // สร้างไอเทมในเกม
        const newItem = {
          name: "ดาบเวทมนตร์",
          description: "ดาบที่เพิ่มพลังโจมตี 5 หน่วย",
          type: "weapon",
          rarity: "uncommon",
          image: "magic-sword.png",
          tokenId: tokenId,
          mintedAt: new Date().toISOString(),
        }

        // บันทึกไอเทมลงฐานข้อมูล
        const result = await receiveNFTItem(gameData.walletAddress, newItem)

        if (result.success) {
          toast.success("สร้าง NFT สำเร็จ", {
            description: `Token ID: ${tokenId}`,
          })
          onReceiveNFT(result.data)
        } else {
          toast.error("ไม่สามารถบันทึกไอเทมได้", {
            description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          })
        }
      }
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast.error("ไม่สามารถสร้าง NFT ได้", {
        description: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      })
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-400" />
          <span>คลังไอเทม NFT</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-black/60 rounded-lg p-1 mb-4">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              คลังไอเทม
            </TabsTrigger>
            <TabsTrigger
              value="mint"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              สร้าง NFT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-0">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {ITEM_TYPES.map((type) => (
                <Button
                  key={type.id}
                  size="sm"
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={
                    selectedType === type.id ? "bg-purple-600 hover:bg-purple-700" : "bg-black/30 border-purple-500/30"
                  }
                  onClick={() => setSelectedType(type.id)}
                >
                  {type.name}
                </Button>
              ))}
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>ไม่มีไอเทมในคลัง</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredItems.map((item: any) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="bg-black/30 rounded-lg border border-purple-500/20 overflow-hidden">
                      {/* Magic UI: แทนรูปภาพด้วย Animation */}
                      <div className="h-24 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
                        <div className="relative w-16 h-16">
                          {/* วงแสงเรืองรอบไอเทม */}
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 3,
                            }}
                            className={`absolute inset-0 rounded-full blur-xl ${
                              item.rarity === "legendary"
                                ? "bg-orange-600/30"
                                : item.rarity === "epic"
                                  ? "bg-purple-600/30"
                                  : item.rarity === "rare"
                                    ? "bg-blue-600/30"
                                    : item.rarity === "uncommon"
                                      ? "bg-green-600/30"
                                      : "bg-gray-600/30"
                            }`}
                          />

                          {/* ไอคอนไอเทม */}
                          <div
                            className={`absolute inset-0 rounded-full border-2 ${
                              item.rarity === "legendary"
                                ? "border-orange-500/50 bg-orange-900/30"
                                : item.rarity === "epic"
                                  ? "border-purple-500/50 bg-purple-900/30"
                                  : item.rarity === "rare"
                                    ? "border-blue-500/50 bg-blue-900/30"
                                    : item.rarity === "uncommon"
                                      ? "border-green-500/50 bg-green-900/30"
                                      : "border-gray-500/50 bg-gray-900/30"
                            }`}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              {item.type === "weapon" && (
                                <Sword
                                  className={`h-8 w-8 ${
                                    item.rarity === "legendary"
                                      ? "text-orange-400"
                                      : item.rarity === "epic"
                                        ? "text-purple-400"
                                        : item.rarity === "rare"
                                          ? "text-blue-400"
                                          : item.rarity === "uncommon"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                  }`}
                                />
                              )}
                              {item.type === "armor" && (
                                <Shield
                                  className={`h-8 w-8 ${
                                    item.rarity === "legendary"
                                      ? "text-orange-400"
                                      : item.rarity === "epic"
                                        ? "text-purple-400"
                                        : item.rarity === "rare"
                                          ? "text-blue-400"
                                          : item.rarity === "uncommon"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                  }`}
                                />
                              )}
                              {item.type === "accessory" && (
                                <Ring
                                  className={`h-8 w-8 ${
                                    item.rarity === "legendary"
                                      ? "text-orange-400"
                                      : item.rarity === "epic"
                                        ? "text-purple-400"
                                        : item.rarity === "rare"
                                          ? "text-blue-400"
                                          : item.rarity === "uncommon"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                  }`}
                                />
                              )}
                              {item.type === "special" && (
                                <Sparkles
                                  className={`h-8 w-8 ${
                                    item.rarity === "legendary"
                                      ? "text-orange-400"
                                      : item.rarity === "epic"
                                        ? "text-purple-400"
                                        : item.rarity === "rare"
                                          ? "text-blue-400"
                                          : item.rarity === "uncommon"
                                            ? "text-green-400"
                                            : "text-gray-400"
                                  }`}
                                />
                              )}
                            </div>
                          </div>

                          {/* อนุภาคลอย */}
                          {item.rarity === "legendary" && (
                            <>
                              {[...Array(3)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 0,
                                  }}
                                  animate={{
                                    x: Math.random() * 40 - 20,
                                    y: Math.random() * 40 - 20,
                                    opacity: [0, 1, 0],
                                  }}
                                  transition={{
                                    repeat: Number.POSITIVE_INFINITY,
                                    duration: 2,
                                    delay: i * 0.5,
                                  }}
                                  className="absolute w-1 h-1 bg-orange-400 rounded-full"
                                  style={{
                                    top: "50%",
                                    left: "50%",
                                  }}
                                />
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      <div className="p-2">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              item.rarity === "legendary"
                                ? "border-orange-500 text-orange-400"
                                : item.rarity === "epic"
                                  ? "border-purple-500 text-purple-400"
                                  : item.rarity === "rare"
                                    ? "border-blue-500 text-blue-400"
                                    : item.rarity === "uncommon"
                                      ? "border-green-500 text-green-400"
                                      : "border-gray-500 text-gray-400"
                            }`}
                          >
                            {RARITIES[item.rarity as keyof typeof RARITIES]?.name || "ธรรมดา"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{item.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mint" className="mt-0">
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">สร้าง NFT ใหม่</h3>
              <p className="text-sm text-gray-400 mb-4">
                คุณสามารถสร้างไอเทม NFT ใหม่ที่มีคุณสมบัติพิเศษและเป็นเจ้าของอย่างแท้จริงบนบล็อกเชน
              </p>

              {/* Magic UI: แทนรูปภาพด้วย Animation */}
              <div className="h-40 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg mb-4 flex items-center justify-center">
                <div className="relative">
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 10,
                      ease: "linear",
                    }}
                    className="w-24 h-24 rounded-full border-2 border-purple-500/30"
                  />

                  <motion.div
                    animate={{
                      rotate: -360,
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 15,
                      ease: "linear",
                    }}
                    className="absolute inset-2 rounded-full border-2 border-blue-500/30"
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-full">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </motion.div>
                </div>
              </div>

              <Button
                onClick={handleMintNFT}
                disabled={isMinting || isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                {isMinting ? "กำลังสร้าง..." : "สร้าง NFT"}
              </Button>
            </div>

            <div className="text-xs text-gray-400">
              <p className="mb-1">หมายเหตุ:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>NFT ที่สร้างจะถูกเก็บไว้ในกระเป๋า MetaMask ของคุณ</li>
                <li>คุณสามารถซื้อขาย NFT ในตลาด OpenSea หรือ Rarible ได้</li>
                <li>ไอเทม NFT จะมีคุณสมบัติพิเศษในเกม</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        {/* แสดงรายละเอียดไอเทม */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-gray-900 rounded-lg border border-purple-500/30 max-w-md w-full"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-800">
                  <h3 className="font-bold">รายละเอียดไอเทม</h3>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setSelectedItem(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-4">
                  <div className="flex gap-4 mb-4">
                    {/* Magic UI: แทนรูปภาพด้วย Animation */}
                    <div className="h-24 w-24 bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center">
                      <div className="relative w-16 h-16">
                        <motion.div
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.5, 0.8, 0.5],
                          }}
                          transition={{
                            repeat: Number.POSITIVE_INFINITY,
                            duration: 3,
                          }}
                          className={`absolute inset-0 rounded-full blur-xl ${
                            selectedItem.rarity === "legendary"
                              ? "bg-orange-600/30"
                              : selectedItem.rarity === "epic"
                                ? "bg-purple-600/30"
                                : selectedItem.rarity === "rare"
                                  ? "bg-blue-600/30"
                                  : selectedItem.rarity === "uncommon"
                                    ? "bg-green-600/30"
                                    : "bg-gray-600/30"
                          }`}
                        />

                        <div
                          className={`absolute inset-0 rounded-full border-2 ${
                            selectedItem.rarity === "legendary"
                              ? "border-orange-500/50 bg-orange-900/30"
                              : selectedItem.rarity === "epic"
                                ? "border-purple-500/50 bg-purple-900/30"
                                : selectedItem.rarity === "rare"
                                  ? "border-blue-500/50 bg-blue-900/30"
                                  : selectedItem.rarity === "uncommon"
                                    ? "border-green-500/50 bg-green-900/30"
                                    : "border-gray-500/50 bg-gray-900/30"
                          }`}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            {selectedItem.type === "weapon" && (
                              <Sword
                                className={`h-8 w-8 ${
                                  selectedItem.rarity === "legendary"
                                    ? "text-orange-400"
                                    : selectedItem.rarity === "epic"
                                      ? "text-purple-400"
                                      : selectedItem.rarity === "rare"
                                        ? "text-blue-400"
                                        : selectedItem.rarity === "uncommon"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                }`}
                              />
                            )}
                            {selectedItem.type === "armor" && (
                              <Shield
                                className={`h-8 w-8 ${
                                  selectedItem.rarity === "legendary"
                                    ? "text-orange-400"
                                    : selectedItem.rarity === "epic"
                                      ? "text-purple-400"
                                      : selectedItem.rarity === "rare"
                                        ? "text-blue-400"
                                        : selectedItem.rarity === "uncommon"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                }`}
                              />
                            )}
                            {selectedItem.type === "accessory" && (
                              <Ring
                                className={`h-8 w-8 ${
                                  selectedItem.rarity === "legendary"
                                    ? "text-orange-400"
                                    : selectedItem.rarity === "epic"
                                      ? "text-purple-400"
                                      : selectedItem.rarity === "rare"
                                        ? "text-blue-400"
                                        : selectedItem.rarity === "uncommon"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                }`}
                              />
                            )}
                            {selectedItem.type === "special" && (
                              <Sparkles
                                className={`h-8 w-8 ${
                                  selectedItem.rarity === "legendary"
                                    ? "text-orange-400"
                                    : selectedItem.rarity === "epic"
                                      ? "text-purple-400"
                                      : selectedItem.rarity === "rare"
                                        ? "text-blue-400"
                                        : selectedItem.rarity === "uncommon"
                                          ? "text-green-400"
                                          : "text-gray-400"
                                }`}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">{selectedItem.name}</h3>
                      <div className="flex gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={`${
                            selectedItem.rarity === "legendary"
                              ? "border-orange-500 text-orange-400"
                              : selectedItem.rarity === "epic"
                                ? "border-purple-500 text-purple-400"
                                : selectedItem.rarity === "rare"
                                  ? "border-blue-500 text-blue-400"
                                  : selectedItem.rarity === "uncommon"
                                    ? "border-green-500 text-green-400"
                                    : "border-gray-500 text-gray-400"
                          }`}
                        >
                          {RARITIES[selectedItem.rarity as keyof typeof RARITIES]?.name || "ธรรมดา"}
                        </Badge>
                        <Badge variant="outline" className="border-purple-500 text-purple-400">
                          {ITEM_TYPES.find((t) => t.id === selectedItem.type)?.name || "ไอเทม"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300">{selectedItem.description}</p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium mb-2">ข้อมูล NFT</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID:</span>
                        <span>{selectedItem.tokenId || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">สร้างเมื่อ:</span>
                        <span>
                          {selectedItem.mintedAt ? new Date(selectedItem.mintedAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">เจ้าของ:</span>
                        <span>
                          {gameData.walletAddress?.slice(0, 6)}...{gameData.walletAddress?.slice(-4)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedItem.tokenId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-purple-500/30"
                      onClick={() =>
                        window.open(
                          `https://opensea.io/assets/ethereum/${process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}/${selectedItem.tokenId}`,
                          "_blank",
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ดูบน OpenSea
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

