"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sword, Shield, ArrowUp, Coins, Star } from "lucide-react";
import { toast } from "sonner";
import { upgradeCharacter } from "@/lib/actions";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";
import confetti from "canvas-confetti";

interface CharacterCardProps {
  character: any;
  gameData: any;
  onUpgrade: (updatedData: any) => void;
  isProcessing: boolean;
}

export default function CharacterCard({
  character,
  gameData,
  onUpgrade,
  isProcessing,
}: CharacterCardProps) {
  const { locale } = useI18n();
  const { address, upgradeCharacter: upgradeCharacterContract } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const [isHovered, setIsHovered] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [xpPercent, setXpPercent] = useState(0);
  const [mounted, setMounted] = useState(false);

  // คำนวณค่าอัพเกรด
  const upgradeCost = character.level * 25;

  // คำนวณค่า XP เป็นเปอร์เซ็นต์
  useEffect(() => {
    setMounted(true);
    if (character && typeof character.experience !== "undefined") {
      const nextLevelXp = character.level * 100;
      const percent = (character.experience / nextLevelXp) * 100;
      setXpPercent(Math.min(percent, 100));
    }
  }, [character]);

  // ฟังก์ชันอัพเกรดตัวละคร
  const handleUpgrade = async () => {
    if (isProcessing || isUpgrading) return;
    if (gameData.coins < upgradeCost) {
      toast.error(locale === "th" ? "เหรียญไม่เพียงพอ" : "Not enough coins", {
        description:
          locale === "th"
            ? `ต้องการ ${upgradeCost} เหรียญ`
            : `You need ${upgradeCost} coins`,
      });
      return;
    }

    const actualAddress = address || wagmiAddress;
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

    setIsUpgrading(true);

    try {
      // แสดงเอฟเฟกต์การอัพเกรด
      const upgradeEffectId = toast.loading(
        locale === "th" ? "กำลังอัพเกรด..." : "Upgrading...",
        {
          description:
            locale === "th"
              ? "กำลังเพิ่มพลังให้กับตัวละคร"
              : "Increasing character power",
        }
      );

      // เรียกใช้ฟังก์ชัน upgradeCharacter จาก contract
      let contractResult;
      try {
        contractResult = await upgradeCharacterContract(character.id);
      } catch (contractError) {
        console.log(
          "Contract upgrade failed, using API fallback:",
          contractError
        );
        // ถ้าเรียก contract ไม่สำเร็จ ให้ใช้ API ปกติโดยไม่แสดงข้อผิดพลาด
      }

      // อัพเดตข้อมูลในฐานข้อมูล
      const result = await upgradeCharacter(
        actualAddress,
        character.id,
        upgradeCost
      );

      if (result.success) {
        // ปิดการแสดงผลการโหลด
        toast.success(
          locale === "th" ? "อัพเกรดสำเร็จ" : "Upgrade successful",
          {
            id: upgradeEffectId,
            description:
              locale === "th"
                ? `${character.name} เลเวล ${character.level} → ${
                    character.level + 1
                  }`
                : `${character.name} Level ${character.level} → ${
                    character.level + 1
                  }`,
          }
        );

        // เพิ่มเอฟเฟกต์เมื่ออัพเกรดสำเร็จ
        if (typeof window !== "undefined") {
          // สร้างเอฟเฟกต์ confetti
          const confettiColors = ["#8b5cf6", "#6366f1", "#ec4899"];
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: confettiColors,
          });
        }

        // อัพเดตข้อมูลตัวละคร
        onUpgrade(result.data);
      } else {
        toast.error(locale === "th" ? "อัพเกรดล้มเหลว" : "Upgrade failed", {
          id: upgradeEffectId,
          description:
            result.error ||
            (locale === "th"
              ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
              : "Unknown error occurred"),
        });
      }
    } catch (error) {
      console.error("Error upgrading character:", error);
      toast.error(locale === "th" ? "อัพเกรดล้มเหลว" : "Upgrade failed", {
        description:
          locale === "th"
            ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
            : "Unknown error occurred",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  if (!mounted) return null;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="relative">
            {/* Magic UI: แทนรูปภาพด้วย Animation */}
            <div className="h-40 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
              <div className="relative w-24 h-24">
                {/* วงแสงเรืองรอบตัวละคร */}
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
                    character.level > 10
                      ? "bg-red-600/30"
                      : character.level > 7
                      ? "bg-yellow-600/30"
                      : character.level > 4
                      ? "bg-blue-600/30"
                      : "bg-purple-600/30"
                  }`}
                />

                {/* ตัวละคร */}
                <div
                  className={`absolute inset-0 rounded-full border-2 ${
                    character.level > 10
                      ? "border-red-500/50 bg-red-900/30"
                      : character.level > 7
                      ? "border-yellow-500/50 bg-yellow-900/30"
                      : character.level > 4
                      ? "border-blue-500/50 bg-blue-900/30"
                      : "border-purple-500/50 bg-purple-900/30"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Sword
                      className={`h-10 w-10 ${
                        character.level > 10
                          ? "text-red-400"
                          : character.level > 7
                          ? "text-yellow-400"
                          : character.level > 4
                          ? "text-blue-400"
                          : "text-purple-400"
                      }`}
                    />
                  </div>
                </div>

                {/* เอฟเฟกต์เมื่อ hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -inset-4"
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          x: Math.cos((i * Math.PI) / 4) * 30,
                          y: Math.sin((i * Math.PI) / 4) * 30,
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.1,
                        }}
                        className={`absolute w-2 h-2 rounded-full ${
                          character.level > 10
                            ? "bg-red-400"
                            : character.level > 7
                            ? "bg-yellow-400"
                            : character.level > 4
                            ? "bg-blue-400"
                            : "bg-purple-400"
                        }`}
                        style={{
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                {/* แสดงเลเวล */}
                <div className="absolute -bottom-2 -right-2 bg-black/70 rounded-full w-8 h-8 flex items-center justify-center border-2 border-gray-700">
                  <span className="text-xs font-bold">{character.level}</span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-bold text-center mb-2">{character.name}</h3>

              {/* แสดงแถบประสบการณ์ */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" />
                    <span>{locale === "th" ? "ประสบการณ์" : "Experience"}</span>
                  </span>
                  <span className="font-mono">
                    {character.experience || 0}/{character.level * 100}
                  </span>
                </div>
                <Progress value={xpPercent} className="h-1.5 xp-bar" />
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span>
                      {locale === "th" ? "พลังโจมตี" : "Attack Power"}
                    </span>
                  </div>
                  <span className="font-mono">{character.damage}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>{locale === "th" ? "ความทนทาน" : "Defense"}</span>
                  </div>
                  <span className="font-mono">{character.level * 10}</span>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={
                  gameData.coins < upgradeCost || isProcessing || isUpgrading
                }
                className={`w-full relative overflow-hidden ${
                  gameData.coins < upgradeCost || isProcessing || isUpgrading
                    ? "bg-gray-600"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                }`}
              >
                {/* เอฟเฟกต์เมื่อปุ่มพร้อมใช้งาน */}
                {!(
                  gameData.coins < upgradeCost ||
                  isProcessing ||
                  isUpgrading
                ) && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      ease: "linear",
                    }}
                  />
                )}

                <ArrowUp className="h-4 w-4 mr-1" />
                {isUpgrading
                  ? locale === "th"
                    ? "กำลังอัพเกรด..."
                    : "Upgrading..."
                  : locale === "th"
                  ? "อัพเกรด"
                  : "Upgrade"}
                <div className="flex items-center ml-2 bg-black/30 px-2 py-0.5 rounded-full">
                  <Coins className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs">{upgradeCost}</span>
                </div>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
