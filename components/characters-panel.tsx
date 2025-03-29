"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, ArrowUp, Coins, Users, Plus } from "lucide-react";
import Image from "next/image";

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
  const characterCost = 50 * gameData.characters.length;

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            <span>นักผจญภัย</span>
          </CardTitle>
          <Badge variant="outline" className="flex gap-1 bg-black/30">
            <Users className="h-4 w-4" />
            {gameData.characters.length} คน
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gameData.characters.map((character) => (
            <motion.div
              key={character.id}
              whileHover={{ scale: 1.03 }}
              className="h-full"
            >
              <Card className="h-full bg-black/40 border-purple-500/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="relative">
                      <Image
                        src={character.image || "/placeholder.svg"}
                        alt={character.name}
                        width={80}
                        height={80}
                        className="rounded-full border-2 border-purple-500"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-purple-700 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-purple-300">
                        {character.level}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold">{character.name}</h3>
                      <div className="flex items-center text-sm text-gray-300 mt-1">
                        <Sword className="h-3 w-3 mr-1 text-red-400" />
                        <span>พลังโจมตี: {character.damage}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between text-xs mb-1">
                      <span>ระดับ {character.level}</span>
                      <span>ระดับ {character.level + 1}</span>
                    </div>
                    <Progress value={50} className="h-1 mb-3" />
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
                    อัพเกรด
                    <div className="ml-auto flex items-center">
                      <Coins className="h-3 w-3 mr-1" />
                      <span>{character.level * 25}</span>
                    </div>
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}

          <motion.div whileHover={{ scale: 1.03 }} className="h-full">
            <Card
              className="h-full border border-dashed border-purple-500/50 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-center p-6 cursor-pointer"
              onClick={() => onBuyCharacter(characterCost)}
            >
              <div className="mb-4 w-16 h-16 rounded-full bg-purple-900/30 flex items-center justify-center">
                <Plus className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="font-medium text-center mb-2">
                จ้างนักผจญภัยใหม่
              </h3>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="h-4 w-4" />
                <span>{characterCost}</span>
              </div>
              {gameData.coins < characterCost && (
                <p className="text-xs text-red-400 mt-2">เหรียญไม่พอ</p>
              )}
              {isProcessing && (
                <p className="text-xs text-gray-400 mt-2">กำลังดำเนินการ...</p>
              )}
            </Card>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
