"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  CheckCircle2,
  Clock,
  Gift,
  Coins,
  Star,
  Sword,
  Shield,
  Zap,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { completeQuest, updateQuestProgress } from "@/lib/actions";
import { useI18n } from "@/lib/i18n";
import confetti from "canvas-confetti";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";

interface QuestSystemProps {
  gameData: any;
  onQuestComplete: (reward: { coins: number; experience: number }) => void;
  isProcessing: boolean;
}

export default function QuestSystem({
  gameData,
  onQuestComplete,
  isProcessing,
}: QuestSystemProps) {
  const { locale } = useI18n();
  const { address } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const [quests, setQuests] = useState<any[]>([]);
  const [activeQuest, setActiveQuest] = useState<any | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [questReward, setQuestReward] = useState({ coins: 0, experience: 0 });
  const [dailyRefreshTime, setDailyRefreshTime] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // สร้างภารกิจประจำวัน
  useEffect(() => {
    if (!gameData || !mounted) return;

    // ตรวจสอบว่ามีภารกิจในข้อมูลเกมหรือไม่
    if (gameData.quests && gameData.quests.length > 0) {
      setQuests(gameData.quests);
    } else {
      // สร้างภารกิจใหม่
      generateDailyQuests();
    }

    // ตั้งค่าเวลารีเซ็ตภารกิจประจำวัน
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);
    setDailyRefreshTime(tomorrow);
  }, [gameData, mounted]);

  // สร้างภารกิจประจำวัน
  const generateDailyQuests = () => {
    if (!gameData) return;

    const currentArea =
      gameData.currentArea || (locale === "th" ? "ป่า" : "forest");
    const playerLevel = Math.max(
      ...(gameData.characters?.map((c: any) => c.level || 1) || [1])
    );
    const characterLevel = Math.max(
      ...(gameData.characters?.map((c: any) => c.level || 1) || [1])
    );

    // คำนวณค่าตัวคูณรางวัลตามพื้นที่
    const areaMultiplier =
      currentArea === "ป่า" || currentArea === "forest"
        ? 1
        : currentArea === "ถ้ำ" || currentArea === "cave"
        ? 2
        : currentArea === "ทะเลทราย" || currentArea === "desert"
        ? 3
        : currentArea === "ภูเขาไฟ" || currentArea === "volcano"
        ? 4
        : 1;

    // คำนวณค่าตัวคูณรางวัลตามเลเวล
    const levelMultiplier = Math.max(1, Math.floor(playerLevel / 5) + 1);

    // สร้างภารกิจหลัก
    const mainQuests = [
      {
        id: Date.now() + 1,
        title: locale === "th" ? "ล่ามอนสเตอร์" : "Monster Hunter",
        description:
          locale === "th"
            ? `สังหารมอนสเตอร์ในพื้นที่ ${currentArea} จำนวน ${
                10 * areaMultiplier
              } ตัว`
            : `Defeat ${10 * areaMultiplier} monsters in ${currentArea} area`,
        reward: {
          coins: 50 * areaMultiplier * levelMultiplier,
          experience: 25 * areaMultiplier,
        },
        progress: gameData.monstersDefeated || 0,
        target: 10 * areaMultiplier,
        type: "monster",
        completed: (gameData.monstersDefeated || 0) >= 10 * areaMultiplier,
        areaRequired: currentArea,
        image: "monster-slay.png",
        icon: "sword",
      },
      {
        id: Date.now() + 2,
        title: locale === "th" ? "เก็บสมบัติ" : "Treasure Hunter",
        description:
          locale === "th"
            ? `เก็บไอเทมจำนวน ${3 + Math.floor(playerLevel / 3)} ชิ้น`
            : `Collect ${3 + Math.floor(playerLevel / 3)} items`,
        reward: {
          coins: 100 * levelMultiplier,
          experience: 40 * levelMultiplier,
        },
        progress: Math.min(
          gameData.inventory?.length || 0,
          3 + Math.floor(playerLevel / 3)
        ),
        target: 3 + Math.floor(playerLevel / 3),
        type: "item",
        completed:
          (gameData.inventory?.length || 0) >= 3 + Math.floor(playerLevel / 3),
        areaRequired: null,
        image: "treasure-hunt.png",
        icon: "gift",
      },
      {
        id: Date.now() + 3,
        title: locale === "th" ? "อัพเกรดนักผจญภัย" : "Character Upgrade",
        description:
          locale === "th"
            ? `อัพเกรดนักผจญภัยให้ถึงระดับ ${characterLevel + 2}`
            : `Upgrade character to level ${characterLevel + 2}`,
        reward: {
          coins: 150 * levelMultiplier,
          experience: 60 * levelMultiplier,
        },
        progress: characterLevel,
        target: characterLevel + 2,
        type: "upgrade",
        completed: characterLevel >= characterLevel + 2,
        areaRequired: null,
        image: "upgrade-character.png",
        icon: "star",
      },
    ];

    // สร้างภารกิจพิเศษตามเลเวลผู้เล่น
    let specialQuests = [];

    // ภารกิจสร้าง NFT (เปิดใช้งานเมื่อเลเวล 3+)
    if (playerLevel >= 3) {
      specialQuests.push({
        id: Date.now() + 4,
        title: locale === "th" ? "สร้าง NFT" : "Create NFT",
        description:
          locale === "th" ? "สร้างไอเทม NFT จำนวน 1 ชิ้น" : "Create 1 NFT item",
        reward: {
          coins: 200 * levelMultiplier,
          experience: 80 * levelMultiplier,
        },
        progress:
          gameData.inventory?.filter((item: any) => item.tokenId)?.length || 0,
        target: 1,
        type: "nft",
        completed:
          (gameData.inventory?.filter((item: any) => item.tokenId)?.length ||
            0) >= 1,
        areaRequired: null,
        image: "create-nft.png",
        icon: "zap",
      });
    }

    // ภารกิจเลเวลอัพ (เปิดใช้งานเมื่อเลเวล 5+)
    if (playerLevel >= 5) {
      specialQuests.push({
        id: Date.now() + 5,
        title: locale === "th" ? "เลเวลอัพ" : "Level Up",
        description:
          locale === "th"
            ? `เพิ่มเลเวลผู้เล่นเป็น ${playerLevel + 1}`
            : `Reach player level ${playerLevel + 1}`,
        reward: {
          coins: 250 * levelMultiplier,
          experience: 100 * levelMultiplier,
        },
        progress: playerLevel,
        target: playerLevel + 1,
        type: "level",
        completed: playerLevel >= playerLevel + 1,
        areaRequired: null,
        image: "level-up.png",
        icon: "star",
      });
    }

    // ภารกิจสะสมเหรียญ (เปิดใช้งานเมื่อเลเวล 7+)
    if (playerLevel >= 7) {
      const coinTarget = 500 * levelMultiplier;
      specialQuests.push({
        id: Date.now() + 6,
        title: locale === "th" ? "นักสะสมเหรียญ" : "Coin Collector",
        description:
          locale === "th"
            ? `สะสมเหรียญให้ได้ ${coinTarget} เหรียญ`
            : `Collect ${coinTarget} coins`,
        reward: {
          coins: 300 * levelMultiplier,
          experience: 120 * levelMultiplier,
        },
        progress: Math.min(gameData.coins || 0, coinTarget),
        target: coinTarget,
        type: "coins",
        completed: (gameData.coins || 0) >= coinTarget,
        areaRequired: null,
        image: "coin-collector.png",
        icon: "coins",
      });
    }

    // รวมภารกิจทั้งหมด
    const allQuests = [...mainQuests, ...specialQuests];
    setQuests(allQuests);
  };

  // รีเฟรชภารกิจ
  const refreshQuests = async () => {
    if (isRefreshing || isProcessing) return;

    setIsRefreshing(true);
    try {
      // อัพเดตความคืบหน้าของภารกิจที่มีอยู่
      const updatedQuests = quests.map((quest) => {
        let progress = 0;

        // คำนวณความคืบหน้าตามประเภทภารกิจ
        switch (quest.type) {
          case "monster":
            progress = gameData.monstersDefeated || 0;
            break;
          case "item":
            progress = gameData.inventory?.length || 0;
            break;
          case "upgrade":
            progress = Math.max(
              ...(gameData.characters?.map((c: any) => c.level || 1) || [1])
            );
            break;
          case "nft":
            progress =
              gameData.inventory?.filter((item: any) => item.tokenId)?.length ||
              0;
            break;
          case "level":
            progress = Math.max(
              ...(gameData.characters?.map((c: any) => c.level || 1) || [1])
            );
            break;
          case "coins":
            progress = gameData.coins || 0;
            break;
          default:
            progress = quest.progress;
        }

        // อัพเดตความคืบหน้าและสถานะการเสร็จสิ้น
        return {
          ...quest,
          progress: Math.min(progress, quest.target),
          completed: progress >= quest.target,
        };
      });

      // อัพเดตภารกิจในฐานข้อมูล
      const actualAddress = wagmiAddress || address;
      if (actualAddress) {
        for (const quest of updatedQuests) {
          try {
            await updateQuestProgress(actualAddress, quest.id, quest.progress);
          } catch (error) {
            console.error("Error updating quest progress:", error);
          }
        }
      }

      // อัพเดตภารกิจในหน้าจอ
      setQuests(updatedQuests);

      toast.success(
        locale === "th" ? "อัพเดตภารกิจสำเร็จ" : "Quests updated successfully",
        {
          description:
            locale === "th"
              ? "ความคืบหน้าของภารกิจได้รับการอัพเดตแล้ว"
              : "Quest progress has been updated",
        }
      );
    } catch (error) {
      console.error("Error refreshing quests:", error);
      toast.error(
        locale === "th"
          ? "ไม่สามารถอัพเดตภารกิจได้"
          : "Failed to update quests",
        {
          description:
            locale === "th"
              ? "เกิดข้อผิดพลาดในการอัพเดตภารกิจ"
              : "An error occurred while updating quests",
        }
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // รับรางวัลจากภารกิจ
  const claimQuestReward = async (quest: any) => {
    if (isProcessing || isRefreshing) return;

    try {
      const actualAddress = wagmiAddress || address;
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

      // อัพเดตสถานะภารกิจในฐานข้อมูล
      const result = await completeQuest(actualAddress, quest.id);

      if (result.success) {
        // แสดงรางวัล
        setQuestReward(quest.reward);
        setShowReward(true);

        // อัพเดตสถานะภารกิจในหน้าจอ
        setQuests((prevQuests) =>
          prevQuests.map((q) =>
            q.id === quest.id
              ? { ...q, progress: q.target, completed: true }
              : q
          )
        );

        // สร้างเอฟเฟกต์ confetti
        if (typeof window !== "undefined") {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#8b5cf6", "#6366f1", "#ec4899"],
          });
        }

        toast.success(locale === "th" ? "ภารกิจสำเร็จ!" : "Quest completed!", {
          description:
            locale === "th"
              ? `คุณได้รับ ${quest.reward.coins} เหรียญ และ ${quest.reward.experience} XP`
              : `You received ${quest.reward.coins} coins and ${quest.reward.experience} XP`,
        });
      } else {
        toast.error(locale === "th" ? "เกิดข้อผิดพลาด" : "An error occurred", {
          description:
            result.error ||
            (locale === "th"
              ? "ไม่สามารถรับรางวัลได้"
              : "Unable to claim reward"),
        });
      }
    } catch (error) {
      console.error("Error claiming quest reward:", error);
      toast.error(locale === "th" ? "เกิดข้อผิดพลาด" : "An error occurred", {
        description:
          locale === "th" ? "ไม่สามารถรับรางวัลได้" : "Unable to claim reward",
      });
    }
  };

  // รับรางวัลและปิดหน้าต่างรางวัล
  const handleClaimReward = () => {
    onQuestComplete(questReward);
    setShowReward(false);
    setActiveQuest(null);
  };

  if (!mounted) return null;

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-yellow-400" />
            <span>{locale === "th" ? "ภารกิจประจำวัน" : "Daily Quests"}</span>
          </CardTitle>

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshQuests}
            disabled={isRefreshing || isProcessing}
            className="h-8 w-8 p-0"
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {showReward ? (
            <motion.div
              key="reward"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-6"
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 10 }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                  duration: 1,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4">
                  <Gift className="h-10 w-10 text-yellow-400" />
                </div>
              </motion.div>

              <h3 className="text-xl font-bold mb-2">
                {locale === "th" ? "ภารกิจสำเร็จ!" : "Quest Completed!"}
              </h3>
              <p className="text-gray-300 mb-4">
                {locale === "th" ? "คุณได้รับรางวัล" : "You received a reward"}
              </p>

              <div className="flex flex-col gap-2 items-center mb-6">
                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <span className="text-xl font-bold text-yellow-300">
                    +{questReward.coins}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 text-blue-400" />
                  <span className="text-xl font-bold text-blue-300">
                    +{questReward.experience} XP
                  </span>
                </div>
              </div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                  onClick={handleClaimReward}
                >
                  {locale === "th" ? "รับรางวัล" : "Claim Reward"}
                </Button>
              </motion.div>
            </motion.div>
          ) : activeQuest ? (
            <motion.div
              key="quest-detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold">{activeQuest.title}</h3>
                  <p className="text-sm text-gray-300">
                    {activeQuest.description}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveQuest(null)}
                >
                  {locale === "th" ? "กลับ" : "Back"}
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{locale === "th" ? "ความคืบหน้า" : "Progress"}</span>
                  <span>
                    {activeQuest.progress}/{activeQuest.target}
                  </span>
                </div>
                <Progress
                  value={(activeQuest.progress / activeQuest.target) * 100}
                  className="h-2"
                />
              </div>

              <div className="bg-black/30 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Gift className="h-5 w-5 text-yellow-400" />
                    <span>{locale === "th" ? "รางวัล:" : "Rewards:"}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span>{locale === "th" ? "เหรียญ" : "Coins"}</span>
                  </div>
                  <span className="font-bold">{activeQuest.reward.coins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-blue-400" />
                    <span>{locale === "th" ? "ประสบการณ์" : "XP"}</span>
                  </div>
                  <span className="font-bold">
                    {activeQuest.reward.experience}
                  </span>
                </div>
              </div>

              {activeQuest.areaRequired && (
                <div className="text-sm text-amber-300 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {locale === "th"
                      ? `ต้องอยู่ในพื้นที่: ${activeQuest.areaRequired}`
                      : `Required area: ${activeQuest.areaRequired}`}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <Button
                  className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                  disabled={
                    !activeQuest.completed || isProcessing || isRefreshing
                  }
                  onClick={() => claimQuestReward(activeQuest)}
                >
                  {activeQuest.completed
                    ? locale === "th"
                      ? "รับรางวัล"
                      : "Claim Reward"
                    : locale === "th"
                    ? "ยังไม่สำเร็จ"
                    : "Not Completed"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quest-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {quests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-400">
                    {locale === "th"
                      ? "ไม่มีภารกิจในขณะนี้"
                      : "No quests available"}
                  </p>
                </div>
              ) : (
                quests.map((quest) => (
                  <motion.div
                    key={quest.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-black/30 rounded-lg p-3 cursor-pointer border border-purple-500/20 hover:border-purple-500/50"
                    onClick={() => setActiveQuest(quest)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{quest.title}</h3>
                          {quest.completed && (
                            <Badge
                              variant="outline"
                              className="bg-green-500/20 text-green-300 border-green-500"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {locale === "th" ? "สำเร็จ" : "Completed"}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                          {quest.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <Coins className="h-3 w-3" />
                          <span>{quest.reward.coins}</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-400 text-xs">
                          <Star className="h-3 w-3" />
                          <span>{quest.reward.experience}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">
                          {locale === "th" ? "ความคืบหน้า" : "Progress"}
                        </span>
                        <span className="text-gray-400">
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                      <Progress
                        value={(quest.progress / quest.target) * 100}
                        className="h-1.5"
                      />
                    </div>
                  </motion.div>
                ))
              )}

              {dailyRefreshTime && (
                <div className="text-xs text-gray-400 flex items-center justify-center gap-1 mt-4">
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {locale === "th"
                      ? `ภารกิจจะรีเซ็ตในเวลา ${dailyRefreshTime.toLocaleTimeString(
                          locale === "th" ? "th-TH" : "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}`
                      : `Quests will reset at ${dailyRefreshTime.toLocaleTimeString(
                          locale === "th" ? "th-TH" : "en-US",
                          { hour: "2-digit", minute: "2-digit" }
                        )}`}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
