"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { changeArea } from "@/lib/actions";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";

interface AreaSelectorProps {
  gameData: any;
  onAreaChange: (updatedData: any) => void;
  isProcessing: boolean;
}

// ข้อมูลพื้นที่
const AREAS = {
  th: [
    {
      id: "ป่า",
      name: "ป่า",
      description: "พื้นที่เริ่มต้นที่มีมอนสเตอร์ระดับต้น",
      color: "from-green-900 to-green-700",
      icon: "🌲",
      level: 1,
    },
    {
      id: "ถ้ำ",
      name: "ถ้ำ",
      description: "พื้นที่ที่มีมอนสเตอร์ระดับกลาง",
      color: "from-gray-900 to-gray-700",
      icon: "🏔️",
      level: 5,
    },
    {
      id: "ทะเลทราย",
      name: "ทะเลทราย",
      description: "พื้นที่ที่มีมอนสเตอร์ระดับสูง",
      color: "from-yellow-900 to-yellow-700",
      icon: "🏜️",
      level: 10,
    },
    {
      id: "ภูเขาไฟ",
      name: "ภูเขาไฟ",
      description: "พื้นที่ที่มีมอนสเตอร์ระดับสูงสุด",
      color: "from-red-900 to-red-700",
      icon: "🌋",
      level: 15,
    },
  ],
  en: [
    {
      id: "forest",
      name: "Forest",
      description: "Starter area with low-level monsters",
      color: "from-green-900 to-green-700",
      icon: "🌲",
      level: 1,
    },
    {
      id: "cave",
      name: "Cave",
      description: "Area with mid-level monsters",
      color: "from-gray-900 to-gray-700",
      icon: "🏔️",
      level: 5,
    },
    {
      id: "desert",
      name: "Desert",
      description: "Area with high-level monsters",
      color: "from-yellow-900 to-yellow-700",
      icon: "🏜️",
      level: 10,
    },
    {
      id: "volcano",
      name: "Volcano",
      description: "Area with the highest level monsters",
      color: "from-red-900 to-red-700",
      icon: "🌋",
      level: 15,
    },
  ],
};

// แปลงชื่อพื้นที่ภาษาไทยเป็นอังกฤษ
const AREA_TRANSLATION: Record<string, string> = {
  ป่า: "forest",
  ถ้ำ: "cave",
  ทะเลทราย: "desert",
  ภูเขาไฟ: "volcano",
  forest: "ป่า",
  cave: "ถ้ำ",
  desert: "ทะเลทราย",
  volcano: "ภูเขาไฟ",
};

export default function AreaSelector({
  gameData,
  onAreaChange,
  isProcessing,
}: AreaSelectorProps) {
  const { t, locale } = useI18n();
  const { address, changeArea: changeAreaContract } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const [isChangingArea, setIsChangingArea] = useState(false);

  // เลือกชุดข้อมูลตามภาษา
  const currentAreas = AREAS[locale as keyof typeof AREAS] || AREAS.en;
  const currentArea =
    gameData?.currentArea || (locale === "th" ? "ป่า" : "forest");

  // ฟังก์ชันเปลี่ยนพื้นที่
  const handleChangeArea = async (areaId: string) => {
    if (isProcessing || isChangingArea) return;
    if (areaId === currentArea) return;

    // เช็คเลเวลขั้นต่ำ
    const area = currentAreas.find((a) => a.id === areaId);
    const playerLevel = Math.max(
      ...(gameData?.characters?.map((c: any) => c.level) || [1])
    );

    if (area && playerLevel < area.level) {
      toast.error(
        locale === "th" ? "เลเวลไม่เพียงพอ" : "Level not high enough",
        {
          description:
            locale === "th"
              ? `ต้องการเลเวล ${area.level} ขึ้นไป`
              : `You need level ${area.level} or higher`,
        }
      );
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

    setIsChangingArea(true);

    try {
      // เรียกใช้ฟังก์ชัน changeArea จาก contract
      const contractResult = await changeAreaContract(areaId);

      if (contractResult) {
        // อัพเดตข้อมูลในฐานข้อมูล
        const result = await changeArea(actualAddress, areaId);

        if (result.success) {
          toast.success(
            locale === "th"
              ? "เปลี่ยนพื้นที่สำเร็จ"
              : "Area changed successfully",
            {
              description:
                locale === "th"
                  ? `เดินทางไปยัง${areaId}แล้ว`
                  : `You have traveled to ${areaId}`,
            }
          );
          onAreaChange(result.data);
        } else {
          toast.error(
            locale === "th" ? "เปลี่ยนพื้นที่ล้มเหลว" : "Failed to change area",
            {
              description:
                result.error ||
                (locale === "th"
                  ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
                  : "Unknown error occurred"),
            }
          );
        }
      } else {
        // ถ้าไม่มีผลลัพธ์จาก contract ให้ใช้ API ปกติ
        const result = await changeArea(actualAddress, areaId);

        if (result.success) {
          toast.success(
            locale === "th"
              ? "เปลี่ยนพื้นที่สำเร็จ"
              : "Area changed successfully",
            {
              description:
                locale === "th"
                  ? `เดินทางไปยัง${areaId}แล้ว`
                  : `You have traveled to ${areaId}`,
            }
          );
          onAreaChange(result.data);
        } else {
          toast.error(
            locale === "th" ? "เปลี่ยนพื้นที่ล้มเหลว" : "Failed to change area",
            {
              description:
                result.error ||
                (locale === "th"
                  ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
                  : "Unknown error occurred"),
            }
          );
        }
      }
    } catch (error) {
      console.error("Error changing area:", error);
      toast.error(
        locale === "th" ? "เปลี่ยนพื้นที่ล้มเหลว" : "Failed to change area",
        {
          description:
            locale === "th"
              ? "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
              : "Unknown error occurred",
        }
      );
    } finally {
      setIsChangingArea(false);
    }
  };

  return (
    <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5 text-purple-400" />
          <h2 className="text-lg font-bold">
            {locale === "th" ? "พื้นที่ผจญภัย" : "Adventure Areas"}
          </h2>
        </div>

        <div className="space-y-3">
          {currentAreas.map((area) => {
            const isCurrentArea = area.id === currentArea;
            const isLocked =
              Math.max(
                ...(gameData?.characters?.map((c: any) => c.level) || [1])
              ) < area.level;

            return (
              <motion.div
                key={area.id}
                whileHover={{
                  scale: isLocked ? 1 : 1.02,
                }}
                className={`relative rounded-lg overflow-hidden ${
                  isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
                onClick={() => !isLocked && handleChangeArea(area.id)}
              >
                <div className={`bg-gradient-to-r ${area.color} p-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{area.icon}</div>
                      <div>
                        <h3 className="font-bold">{area.name}</h3>
                        <p className="text-xs text-gray-200">
                          {area.description}
                        </p>
                      </div>
                    </div>

                    {isCurrentArea ? (
                      <div className="bg-white/20 px-2 py-1 rounded-full text-xs">
                        {locale === "th" ? "ปัจจุบัน" : "Current"}
                      </div>
                    ) : isLocked ? (
                      <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full text-xs">
                        <span>
                          {locale === "th"
                            ? `ต้องการเลเวล ${area.level}`
                            : `Requires Level ${area.level}`}
                        </span>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-black/30 border-white/20"
                        disabled={isChangingArea || isProcessing}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
