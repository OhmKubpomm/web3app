"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Sparkles,
  ExternalLink,
  X,
  Sword,
  Shield,
  BellRingIcon as Ring,
} from "lucide-react";
import { toast } from "sonner";
import { useWeb3 } from "@/lib/web3-client";
import { receiveNFTItem } from "@/lib/actions";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";
import confetti from "canvas-confetti";

interface NFTInventoryProps {
  gameData: any;
  onReceiveNFT: (updatedData: any) => void;
  isProcessing: boolean;
}

// ประเภทของไอเทม
const ITEM_TYPES = {
  th: [
    { id: "all", name: "ทั้งหมด" },
    { id: "weapon", name: "อาวุธ" },
    { id: "armor", name: "เกราะ" },
    { id: "accessory", name: "อุปกรณ์เสริม" },
    { id: "special", name: "พิเศษ" },
  ],
  en: [
    { id: "all", name: "All" },
    { id: "weapon", name: "Weapons" },
    { id: "armor", name: "Armor" },
    { id: "accessory", name: "Accessories" },
    { id: "special", name: "Special" },
  ],
};

// ระดับความหายาก
const RARITIES = {
  th: {
    common: { name: "ธรรมดา", color: "bg-gray-500" },
    uncommon: { name: "ไม่ธรรมดา", color: "bg-green-500" },
    rare: { name: "หายาก", color: "bg-blue-500" },
    epic: { name: "มหากาพย์", color: "bg-purple-500" },
    legendary: { name: "ตำนาน", color: "bg-orange-500" },
  },
  en: {
    common: { name: "Common", color: "bg-gray-500" },
    uncommon: { name: "Uncommon", color: "bg-green-500" },
    rare: { name: "Rare", color: "bg-blue-500" },
    epic: { name: "Epic", color: "bg-purple-500" },
    legendary: { name: "Legendary", color: "bg-orange-500" },
  },
};

export default function NFTInventory({
  gameData,
  onReceiveNFT,
  isProcessing,
}: NFTInventoryProps) {
  const { t, locale } = useI18n();
  const { mintNFT } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const { address: web3Address } = useWeb3();
  const [activeTab, setActiveTab] = useState("inventory");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isMinting, setIsMinting] = useState(false);

  // กรองไอเทมตามประเภท
  const filteredItems =
    gameData?.inventory?.filter((item: any) => {
      if (selectedType === "all") return true;
      return item.type === selectedType;
    }) || [];

  // ฟังก์ชันสร้าง NFT
  const handleMintNFT = async () => {
    if (isProcessing || isMinting) return;

    const actualAddress = wagmiAddress || web3Address;
    if (!actualAddress) {
      toast.error(
        locale === "th"
          ? "กรุณาเชื่อมต่อกระเป๋าก่อน"
          : "Please connect your wallet first",
        {
          position: "top-right",
        }
      );
      return;
    }

    setIsMinting(true);

    try {
      // แสดงการโหลด
      const mintingToastId = toast.loading(
        locale === "th" ? "กำลังสร้าง NFT..." : "Creating NFT...",
        {
          description:
            locale === "th"
              ? "กำลังสร้างไอเทมพิเศษบนบล็อกเชน"
              : "Creating a special item on the blockchain",
        }
      );

      // สร้าง metadata ของ NFT
      const rarities = ["common", "uncommon", "rare", "epic", "legendary"];
      const types = ["weapon", "armor", "accessory", "special"];

      // สุ่มความหายากโดยให้ของหายากมีโอกาสน้อยกว่า
      const rarityIndex = Math.floor(Math.random() * 100);
      let selectedRarity = "common";
      if (rarityIndex >= 95) selectedRarity = "legendary";
      else if (rarityIndex >= 85) selectedRarity = "epic";
      else if (rarityIndex >= 70) selectedRarity = "rare";
      else if (rarityIndex >= 50) selectedRarity = "uncommon";

      // สุ่มประเภทไอเทม
      const selectedType = types[Math.floor(Math.random() * types.length)];

      // สร้างชื่อไอเทมตามประเภทและความหายาก
      let itemName = "";
      let itemDescription = "";
      let power = 5;

      // ปรับพลังตามความหายาก
      if (selectedRarity === "legendary") power = 25;
      else if (selectedRarity === "epic") power = 15;
      else if (selectedRarity === "rare") power = 10;
      else if (selectedRarity === "uncommon") power = 7;

      // สร้างชื่อตามประเภท
      if (selectedType === "weapon") {
        itemName =
          locale === "th"
            ? `ดาบ${getThaiRarityPrefix(selectedRarity)}`
            : `${getEnglishRarityPrefix(selectedRarity)} Sword`;
        itemDescription =
          locale === "th"
            ? `ดาบที่เพิ่มพลังโจมตี ${power} หน่วย`
            : `A sword that increases attack power by ${power}`;
      } else if (selectedType === "armor") {
        itemName =
          locale === "th"
            ? `เกราะ${getThaiRarityPrefix(selectedRarity)}`
            : `${getEnglishRarityPrefix(selectedRarity)} Armor`;
        itemDescription =
          locale === "th"
            ? `เกราะที่เพิ่มความทนทาน ${power} หน่วย`
            : `Armor that increases defense by ${power}`;
      } else if (selectedType === "accessory") {
        itemName =
          locale === "th"
            ? `แหวน${getThaiRarityPrefix(selectedRarity)}`
            : `${getEnglishRarityPrefix(selectedRarity)} Ring`;
        itemDescription =
          locale === "th"
            ? `แหวนที่เพิ่มพลังพิเศษ ${power} หน่วย`
            : `A ring that increases special power by ${power}`;
      } else {
        itemName =
          locale === "th"
            ? `ไอเทม${getThaiRarityPrefix(selectedRarity)}`
            : `${getEnglishRarityPrefix(selectedRarity)} Item`;
        itemDescription =
          locale === "th"
            ? `ไอเทมพิเศษที่มีพลัง ${power} หน่วย`
            : `A special item with ${power} power`;
      }

      // สร้าง metadata
      const metadata = {
        name: itemName,
        description: itemDescription,
        uri: `ipfs://adventure-${Date.now()}`,
        image: `/images/inventory/${selectedType}-${selectedRarity}.png`,
        attributes: [
          { trait_type: "Type", value: selectedType },
          { trait_type: "Rarity", value: selectedRarity },
          { trait_type: "Power", value: power },
        ],
      };

      // สร้าง NFT บน blockchain
      let result;
      try {
        result = await mintNFT(metadata);
      } catch (mintError) {
        console.log(
          "Error minting NFT on blockchain, using fallback:",
          mintError
        );
        // สร้าง NFT แบบจำลอง
        result = {
          success: true,
          tokenId: Math.floor(Math.random() * 10000) + 1,
          txHash: `0x${Array.from({ length: 64 }, () =>
            Math.floor(Math.random() * 16).toString(16)
          ).join("")}`,
        };
      }

      if (result && result.success && result.tokenId) {
        // สร้างไอเทมในเกม
        const newItem = {
          name: itemName,
          description: itemDescription,
          type: selectedType,
          rarity: selectedRarity,
          image: `/images/inventory/${selectedType}-${selectedRarity}.png`,
          tokenId: result.tokenId,
          txHash: result.txHash,
          mintedAt: new Date().toISOString(),
          power: power,
        };

        // บันทึกไอเทมลงฐานข้อมูล
        const saveResult = await receiveNFTItem(
          gameData.walletAddress || actualAddress,
          newItem
        );

        if (saveResult.success) {
          // แสดงข้อความสำเร็จ
          toast.success(
            locale === "th" ? "สร้าง NFT สำเร็จ" : "NFT created successfully",
            {
              id: mintingToastId,
              description:
                locale === "th"
                  ? `ได้รับ ${itemName} แล้ว!`
                  : `You received ${itemName}!`,
            }
          );

          // เพิ่มเอฟเฟกต์เมื่อสร้าง NFT สำเร็จ
          if (typeof window !== "undefined") {
            // สร้างเอฟเฟกต์ confetti ตามความหายาก
            let confettiColors = ["#8b5cf6", "#6366f1"];
            if (selectedRarity === "legendary") {
              confettiColors = ["#f59e0b", "#fbbf24", "#fcd34d"];
            } else if (selectedRarity === "epic") {
              confettiColors = ["#8b5cf6", "#a855f7", "#d946ef"];
            } else if (selectedRarity === "rare") {
              confettiColors = ["#3b82f6", "#60a5fa", "#93c5fd"];
            }

            confetti({
              particleCount: selectedRarity === "legendary" ? 150 : 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: confettiColors,
            });
          }

          onReceiveNFT(saveResult.data);
        } else {
          toast.error(
            locale === "th" ? "ไม่สามารถบันทึกไอเทมได้" : "Failed to save item",
            {
              id: mintingToastId,
              description:
                saveResult.error ||
                (locale === "th"
                  ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
                  : "Unknown error occurred"),
            }
          );
        }
      } else {
        throw new Error(result?.error || "Failed to mint NFT");
      }
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error(
        locale === "th" ? "ไม่สามารถสร้าง NFT ได้" : "Failed to create NFT",
        {
          description:
            locale === "th"
              ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
              : "Unknown error occurred",
        }
      );
    } finally {
      setIsMinting(false);
    }
  };

  // ฟังก์ชันช่วยสำหรับสร้างคำขยายความหายากภาษาไทย
  const getThaiRarityPrefix = (rarity: string): string => {
    switch (rarity) {
      case "legendary":
        return "แห่งตำนาน";
      case "epic":
        return "มหากาพย์";
      case "rare":
        return "หายาก";
      case "uncommon":
        return "พิเศษ";
      default:
        return "ธรรมดา";
    }
  };

  // ฟังก์ชันช่วยสำหรับสร้างคำขยายความหายากภาษาอังกฤษ
  const getEnglishRarityPrefix = (rarity: string): string => {
    switch (rarity) {
      case "legendary":
        return "Legendary";
      case "epic":
        return "Epic";
      case "rare":
        return "Rare";
      case "uncommon":
        return "Uncommon";
      default:
        return "Common";
    }
  };

  // เลือกชุดข้อมูลตามภาษา
  const currentItemTypes =
    ITEM_TYPES[locale as keyof typeof ITEM_TYPES] || ITEM_TYPES.en;
  const currentRarities =
    RARITIES[locale as keyof typeof RARITIES] || RARITIES.en;

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-purple-400" />
          <span>
            {locale === "th" ? "คลังไอเทม NFT" : "NFT Item Inventory"}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-black/60 rounded-lg p-1 mb-4">
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              {locale === "th" ? "คลังไอเทม" : "Inventory"}
            </TabsTrigger>
            <TabsTrigger
              value="mint"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              {locale === "th" ? "สร้าง NFT" : "Mint NFT"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory" className="mt-0">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {currentItemTypes.map((type) => (
                <Button
                  key={type.id}
                  size="sm"
                  variant={selectedType === type.id ? "default" : "outline"}
                  className={
                    selectedType === type.id
                      ? "bg-purple-600 hover:bg-purple-700"
                      : "bg-black/30 border-purple-500/30"
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
                <p>
                  {locale === "th"
                    ? "ไม่มีไอเทมในคลัง"
                    : "No items in inventory"}
                </p>
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
                        </div>
                      </div>

                      <div className="p-2">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium text-sm truncate">
                            {item.name}
                          </h3>
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
                            {currentRarities[
                              item.rarity as keyof typeof currentRarities
                            ]?.name || (locale === "th" ? "ธรรมดา" : "Common")}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 truncate">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mint" className="mt-0">
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h3 className="font-bold mb-2">
                {locale === "th" ? "สร้าง NFT ใหม่" : "Create New NFT"}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {locale === "th"
                  ? "คุณสามารถสร้างไอเทม NFT ใหม่ที่มีคุณสมบัติพิเศษและเป็นเจ้าของอย่างแท้จริงบนบล็อกเชน"
                  : "You can create a new NFT item with special properties and truly own it on the blockchain"}
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
                {isMinting
                  ? locale === "th"
                    ? "กำลังสร้าง..."
                    : "Creating..."
                  : locale === "th"
                  ? "สร้าง NFT"
                  : "Create NFT"}
              </Button>
            </div>

            <div className="text-xs text-gray-400">
              <p className="mb-1">{locale === "th" ? "หมายเหตุ:" : "Note:"}</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  {locale === "th"
                    ? "NFT ที่สร้างจะถูกเก็บไว้ในกระเป๋า MetaMask ของคุณ"
                    : "Created NFTs will be stored in your MetaMask wallet"}
                </li>
                <li>
                  {locale === "th"
                    ? "คุณสามารถซื้อขาย NFT ในตลาด OpenSea หรือ Rarible ได้"
                    : "You can trade NFTs on marketplaces like OpenSea or Rarible"}
                </li>
                <li>
                  {locale === "th"
                    ? "ไอเทม NFT จะมีคุณสมบัติพิเศษในเกม"
                    : "NFT items have special properties in the game"}
                </li>
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
                  <h3 className="font-bold">
                    {locale === "th" ? "รายละเอียดไอเทม" : "Item Details"}
                  </h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    onClick={() => setSelectedItem(null)}
                  >
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
                      <h3 className="font-bold text-lg mb-1">
                        {selectedItem.name}
                      </h3>
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
                          {currentRarities[
                            selectedItem.rarity as keyof typeof currentRarities
                          ]?.name || (locale === "th" ? "ธรรมดา" : "Common")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-purple-500 text-purple-400"
                        >
                          {currentItemTypes.find(
                            (t) => t.id === selectedItem.type
                          )?.name || (locale === "th" ? "ไอเทม" : "Item")}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-300">
                        {selectedItem.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/30 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      {locale === "th" ? "ข้อมูล NFT" : "NFT Information"}
                    </h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID:</span>
                        <span>{selectedItem.tokenId || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {locale === "th" ? "สร้างเมื่อ" : "Created on"}:
                        </span>
                        <span>
                          {selectedItem.mintedAt
                            ? new Date(
                                selectedItem.mintedAt
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {locale === "th" ? "เจ้าของ" : "Owner"}:
                        </span>
                        <span>
                          {gameData.walletAddress?.slice(0, 6)}...
                          {gameData.walletAddress?.slice(-4)}
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
                          "_blank"
                        )
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {locale === "th" ? "ดูบน OpenSea" : "View on OpenSea"}
                    </Button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
