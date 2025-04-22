"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Shield, Sword, Coins, ChevronRight } from "lucide-react";
import { useMemo } from "react";

interface UpgradesPanelProps {
  gameData: any;
  onBuyUpgrade: (type: string, cost: number) => void;
  isProcessing: boolean;
}

export default function UpgradesPanel({
  gameData,
  onBuyUpgrade,
  isProcessing,
}: UpgradesPanelProps) {
  // กำหนดราคาอัพเกรด
  const autoBattleCost = 100;
  const inventorySlotsCost = 250;
  const damageMultiplierCost = 500;

  // ป้องกัน error กรณี gameData หรือ gameData.upgrades เป็น undefined
  const upgrades = useMemo(() => gameData?.upgrades || {}, [gameData]);
  const coins = gameData?.coins ?? 0;

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">อัพเกรดระบบ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <motion.div whileHover={{ scale: upgrades.autoBattle ? 1 : 1.02 }}>
          <Button
            variant="outline"
            className="w-full justify-between bg-purple-950/50 border-purple-500/50 hover:bg-purple-900/70"
            disabled={
              coins < autoBattleCost || upgrades.autoBattle || isProcessing
            }
            onClick={() => onBuyUpgrade("autoBattle", autoBattleCost)}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>ระบบต่อสู้อัตโนมัติ</span>
            </div>
            <div className="flex items-center gap-1">
              {upgrades.autoBattle ? (
                <span className="text-green-400">ปลดล็อกแล้ว</span>
              ) : (
                <>
                  <Coins className="h-4 w-4" />
                  <span>{autoBattleCost}</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </div>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Button
            variant="outline"
            className="w-full justify-between bg-purple-950/50 border-purple-500/50 hover:bg-purple-900/70"
            disabled={coins < inventorySlotsCost || isProcessing}
            onClick={() => onBuyUpgrade("inventorySlots", inventorySlotsCost)}
          >
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>เพิ่มช่องเก็บไอเทม</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span>{inventorySlotsCost}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Button>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Button
            variant="outline"
            className="w-full justify-between bg-purple-950/50 border-purple-500/50 hover:bg-purple-900/70"
            disabled={coins < damageMultiplierCost || isProcessing}
            onClick={() =>
              onBuyUpgrade("damageMultiplier", damageMultiplierCost)
            }
          >
            <div className="flex items-center gap-2">
              <Sword className="h-4 w-4 text-red-400" />
              <span>เพิ่มพลังโจมตี 2 เท่า</span>
            </div>
            <div className="flex items-center gap-1">
              <Coins className="h-4 w-4" />
              <span>{damageMultiplierCost}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </Button>
        </motion.div>

        <div className="mt-2 p-3 bg-black/30 rounded-md text-xs text-gray-400">
          <p>
            อัพเกรดระบบจะช่วยให้คุณเก็บเลเวลได้เร็วขึ้น
            และเพิ่มประสิทธิภาพในการต่อสู้
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
