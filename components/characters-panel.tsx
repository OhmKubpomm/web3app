"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, ArrowUp, Coins, Users, Plus, Star, Shield } from "lucide-react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface CharactersPanelProps {
  gameData: any;
  onBuyCharacter: (cost: number) => void;
  onUpgradeCharacter: (id: number, cost: number) => void;
  isProcessing: boolean;
}

export default function CharactersPanel({
  gameData,
  onBuyCharacter,
  onUpgradeCharacter,
  isProcessing,
}: CharactersPanelProps) {
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null);

  // คำนวณราคาตัวละครใหม่
  const characterCost = (gameData.characters?.length || 0) * 100 + 100;

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span>{locale === "th" ? "นักผจญภัย" : "Adventurers"}</span>
          </CardTitle>
          <Badge variant="outline" className="flex gap-1 bg-black/30">
            <Users className="h-4 w-4" />
            {gameData.characters.length} {locale === "th" ? "คน" : "characters"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameData.characters.map((character: any) => {
            // คำนวณค่า XP เป็นเปอร์เซ็นต์
            const nextLevelXp = character.level * 100;
            const xpPercent = Math.min(
              ((character.experience || 0) / nextLevelXp) * 100,
              100
            );

            return (
              <motion.div
                key={character.id}
                whileHover={{ scale: 1.03 }}
                className="h-full"
                onHoverStart={() => setHoveredCharacter(character.id)}
                onHoverEnd={() => setHoveredCharacter(null)}
              >
                <Card className="h-full bg-black/40 border-purple-500/50 backdrop-blur-sm">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        {/* ตัวละคร */}
                        <div className="relative w-20 h-20">
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
                          {hoveredCharacter === character.id && (
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
                            <span className="text-xs font-bold">
                              {character.level}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold">{character.name}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center text-sm text-gray-300">
                            <Sword className="h-3 w-3 mr-1 text-red-400" />
                            <span>
                              {locale === "th" ? "พลังโจมตี" : "Attack"}:{" "}
                              {character.damage}
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Shield className="h-3 w-3 mr-1 text-blue-400" />
                            <span>
                              {locale === "th" ? "ความทนทาน" : "Defense"}:{" "}
                              {character.level * 10}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex justify-between text-xs mb-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>
                            {locale === "th" ? "ประสบการณ์" : "Experience"}
                          </span>
                        </div>
                        <span>
                          {character.experience || 0}/{nextLevelXp}
                        </span>
                      </div>
                      <Progress
                        value={xpPercent}
                        className="h-1.5 xp-bar mb-3"
                      />
                    </div>
                  </CardContent>

                  <div className="p-4 pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-purple-950/50 border-purple-500/50 hover:bg-purple-900/70"
                      onClick={() =>
                        onUpgradeCharacter(character.id, character.level * 25)
                      }
                      disabled={
                        gameData.coins < character.level * 25 || isProcessing
                      }
                    >
                      <ArrowUp className="h-4 w-4 mr-2" />
                      {locale === "th" ? "อัพเกรด" : "Upgrade"}
                      <div className="ml-auto flex items-center">
                        <Coins className="h-3 w-3 mr-1" />
                        <span>{character.level * 25}</span>
                      </div>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}

          <motion.div whileHover={{ scale: 1.03 }} className="h-full">
            <Card
              className="h-full border border-dashed border-purple-500/50 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 cursor-pointer"
              onClick={() => {
                if (gameData.coins < characterCost) {
                  toast.error(
                    locale === "th" ? "เหรียญไม่เพียงพอ" : "Not enough coins",
                    {
                      description:
                        locale === "th"
                          ? `ต้องการ ${characterCost} เหรียญ`
                          : `You need ${characterCost} coins`,
                    }
                  );
                  return;
                }

                if (isProcessing) {
                  return;
                }

                onBuyCharacter(characterCost);
              }}
            >
              <div className="mb-4 w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center">
                <Plus className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-medium text-center mb-2">
                {locale === "th" ? "จ้างนักผจญภัยใหม่" : "Hire New Adventurer"}
              </h3>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="h-4 w-4" />
                <span>{characterCost}</span>
              </div>
              {gameData.coins < characterCost && (
                <p className="text-xs text-red-400 mt-2">
                  {locale === "th" ? "เหรียญไม่พอ" : "Not enough coins"}
                </p>
              )}
              {isProcessing && (
                <p className="text-xs text-gray-400 mt-2">
                  {locale === "th" ? "กำลังดำเนินการ..." : "Processing..."}
                </p>
              )}
            </Card>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
