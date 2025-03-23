"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GameHeader from "@/components/game-header";
import MonsterCard from "@/components/monster-card";
import CharacterCard from "@/components/character-card";
import QuestSystem from "@/components/quest-system";
import AreaSelector from "@/components/area-selector";
import NFTInventory from "@/components/nft-inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Sword,
  Coins,
  Map,
  Scroll,
  Trophy,
  Zap,
  BarChart3,
  Users,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import { buyCharacter, loadGameData } from "@/lib/actions";
import { useAccount } from "wagmi";

interface GameDashboardProps {
  playerAddress?: string;
  initialGameData?: any;
}

export default function GameDashboard({
  playerAddress,
  initialGameData,
}: GameDashboardProps) {
  const { address } = useAccount();
  const [gameData, setGameData] = useState(initialGameData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(!initialGameData);
  const [activeTab, setActiveTab] = useState("battle");
  const [showStats, setShowStats] = useState(false);
  const [battleStats, setBattleStats] = useState({
    monstersDefeated: 0,
    coinsEarned: 0,
    itemsFound: 0,
  });

  // โหลดข้อมูลเกมถ้าไม่มี initialGameData
  useEffect(() => {
    const fetchGameData = async () => {
      if (!initialGameData && (playerAddress || address)) {
        setIsLoading(true);
        try {
          const { success, data, error } = await loadGameData(
            playerAddress || address || ""
          );
          if (success && data) {
            setGameData(data);
          } else {
            console.error("Error loading game data:", error);
            toast.error("ไม่สามารถโหลดข้อมูลเกมได้", {
              description: "กรุณาลองใหม่อีกครั้ง",
              position: "top-right",
            });
          }
        } catch (error) {
          console.error("Error loading game data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGameData();
  }, [initialGameData, playerAddress, address]);

  // ฟังก์ชันอัพเดตเหรียญ
  const handleCoinsUpdate = (amount: number) => {
    setGameData((prev: any) => ({
      ...prev,
      coins: prev.coins + amount,
    }));

    // อัพเดตสถิติการต่อสู้
    setBattleStats((prev) => ({
      ...prev,
      coinsEarned: prev.coinsEarned + amount,
      monstersDefeated: prev.monstersDefeated + 1,
    }));
  };

  // ฟังก์ชันอัพเดตข้อมูลเกม
  const handleGameDataUpdate = (updatedData: any) => {
    setGameData(updatedData);
  };

  // ฟังก์ชันซื้อตัวละครใหม่
  const handleBuyCharacter = async () => {
    if (isProcessing) return;

    // คำนวณราคาตัวละครใหม่
    const characterCost = (gameData.characters?.length || 0) * 100 + 100;

    if (gameData.coins < characterCost) {
      toast.error("เหรียญไม่เพียงพอ", {
        description: `ต้องการ ${characterCost} เหรียญ`,
        position: "top-right",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const result = await buyCharacter(
        playerAddress || address || "",
        characterCost
      );

      if (result.success) {
        toast.success("ซื้อตัวละครสำเร็จ", {
          description: "คุณได้รับนักผจญภัยคนใหม่แล้ว!",
          position: "top-right",
        });
        setGameData(result.data);
      } else {
        toast.error("ซื้อตัวละครล้มเหลว", {
          description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          position: "top-right",
        });
      }
    } catch (error) {
      console.error("Error buying character:", error);
      toast.error("ซื้อตัวละครล้มเหลว", {
        description: "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        position: "top-right",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // ฟังก์ชันเมื่อพบไอเทม
  const handleItemFound = () => {
    setBattleStats((prev) => ({
      ...prev,
      itemsFound: prev.itemsFound + 1,
    }));
  };

  // แสดงสถิติหลังจากโหลดหน้า
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowStats(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // แสดงหน้าโหลด
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <h2 className="text-xl font-semibold">กำลังโหลดข้อมูลเกม...</h2>
        </div>
      </div>
    );
  }

  // ถ้าไม่มีข้อมูลเกม
  if (!gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center p-8 bg-black/50 rounded-lg border border-red-500/30 max-w-md">
          <h2 className="text-xl font-semibold mb-4 text-red-400">
            ไม่พบข้อมูลเกม
          </h2>
          <p className="mb-4">ไม่สามารถโหลดข้อมูลเกมได้ กรุณาลองใหม่อีกครั้ง</p>
          <Button onClick={() => window.location.reload()}>โหลดใหม่</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* พื้นหลังแบบ Gradient ที่สวยงาม */}
      <div className="fixed inset-0 bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>

      <GameHeader gameData={gameData} />

      <main className="relative z-10 container mx-auto px-4 py-20">
        {/* Game Stats Bar */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
            >
              <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-yellow-900/30 p-2 rounded-full">
                    <Coins className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">เหรียญ</p>
                    <p className="font-bold text-lg">
                      {gameData.coins.toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-red-900/30 p-2 rounded-full">
                    <Sword className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">พลังโจมตี</p>
                    <p className="font-bold text-lg">{gameData.damage}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-blue-900/30 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">โจมตีอัตโนมัติ</p>
                    <p className="font-bold text-lg">
                      {gameData.autoDamage}/วิ
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-green-900/30 p-2 rounded-full">
                    <Map className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">พื้นที่</p>
                    <p className="font-bold text-lg">{gameData.currentArea}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-4 bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-1">
            <TabsTrigger
              value="battle"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              <Sword className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">การต่อสู้</span>
            </TabsTrigger>
            <TabsTrigger
              value="characters"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">ตัวละคร</span>
            </TabsTrigger>
            <TabsTrigger
              value="quests"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              <Scroll className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">ภารกิจ</span>
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
            >
              <Package className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">ไอเทม</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Bento Box Layout */}
        <AnimatePresence mode="wait">
          {activeTab === "battle" && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6"
            >
              {/* Battle Area - 8 columns */}
              <div className="md:col-span-8 space-y-6">
                <MonsterCard
                  gameData={gameData}
                  onDefeat={handleCoinsUpdate}
                  onItemFound={handleItemFound}
                  isProcessing={isProcessing}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-green-900/30 p-2 rounded-full">
                          <BarChart3 className="h-5 w-5 text-green-400" />
                        </div>
                        <h3 className="font-bold">สถิติการต่อสู้</h3>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            มอนสเตอร์ที่กำจัด
                          </span>
                          <span className="font-mono">
                            {battleStats.monstersDefeated}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            เหรียญที่ได้รับ
                          </span>
                          <span className="font-mono">
                            {battleStats.coinsEarned}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">
                            ไอเทมที่พบ
                          </span>
                          <span className="font-mono">
                            {battleStats.itemsFound}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <AreaSelector
                    gameData={gameData}
                    onAreaChange={handleGameDataUpdate}
                    isProcessing={isProcessing}
                  />
                </div>
              </div>

              {/* Side Panel - 4 columns */}
              <div className="md:col-span-4 space-y-6">
                <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-purple-900/30 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-purple-400" />
                      </div>
                      <h3 className="font-bold">ตัวละครหลัก</h3>
                    </div>

                    {gameData.characters?.length > 0 && (
                      <div className="space-y-4">
                        {gameData.characters
                          .slice(0, 1)
                          .map((character: any) => (
                            <CharacterCard
                              key={character.id}
                              character={character}
                              gameData={gameData}
                              onUpgrade={handleGameDataUpdate}
                              isProcessing={isProcessing}
                            />
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <QuestSystem
                  gameData={gameData}
                  onQuestComplete={handleCoinsUpdate}
                  isProcessing={isProcessing}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "characters" && (
            <motion.div
              key="characters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <div className="flex flex-col items-center justify-center py-8">
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
            </motion.div>
          )}

          {activeTab === "quests" && (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <QuestSystem
                  gameData={gameData}
                  onQuestComplete={handleCoinsUpdate}
                  isProcessing={isProcessing}
                  expanded={true}
                />

                <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-blue-900/30 p-2 rounded-full">
                        <Trophy className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="font-bold">ความสำเร็จ</h3>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">นักล่ามือใหม่</span>
                          <span className="text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                            สำเร็จ
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          กำจัดมอนสเตอร์ 10 ตัว
                        </p>
                      </div>

                      <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">นักสะสมเหรียญ</span>
                          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full">
                            50%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          สะสมเหรียญ 1,000 เหรียญ
                        </p>
                      </div>

                      <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">นักผจญภัยระดับสูง</span>
                          <span className="text-xs bg-gray-700/50 text-gray-400 px-2 py-0.5 rounded-full">
                            0%
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          อัพเกรดตัวละครถึงเลเวล 10
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {activeTab === "inventory" && (
            <motion.div
              key="inventory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <NFTInventory
                gameData={gameData}
                onReceiveNFT={handleGameDataUpdate}
                isProcessing={isProcessing}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
