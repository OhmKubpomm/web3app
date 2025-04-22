"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sword, Sparkles, Coins, Heart, Zap } from "lucide-react";
import Image from "next/image";
import { recordBattle } from "@/lib/actions";
import { toast } from "sonner";

// Import confetti using require to avoid TypeScript issues
const confetti = require('canvas-confetti');

// กำหนด interface สำหรับ monster และ game data
interface Monster {
  name: string;
  health: number;
  maxHealth: number;
  reward: number;
  area: string;
  background: string;
  itemChance: number;
  image: string;
}

interface TreasureItem {
  name: string;
  description: string;
  type: string;
  rarity: string;
  image: string;
}

interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  isCritical: boolean;
}

interface BattleEffect {
  id: number;
  type: string;
  x: number;
  y: number;
}

interface BattleAreaProps {
  gameData: {
    currentArea?: string;
    characters?: {
      level: number;
    }[];
    damage?: number;
    upgrades?: {
      damageMultiplier?: number;
      criticalChance?: number;
      criticalMultiplier?: number;
    };
    walletAddress?: string;
  };
  onAttack: (amount: number) => void;
  onMintNFT: (item: TreasureItem) => void;
  isProcessing: boolean;
  onMonsterDefeated?: () => void;
}

export default function BattleArea({
  gameData,
  onAttack,
  onMintNFT,
  isProcessing,
  onMonsterDefeated,
}: BattleAreaProps) {
  const [monster, setMonster] = useState<Monster | null>(null);
  const [monsterHealth, setMonsterHealth] = useState(100);
  const [isAttacking, setIsAttacking] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<DamageNumber[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState<NodeJS.Timeout | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showTreasure, setShowTreasure] = useState(false);
  const [treasureItem, setTreasureItem] = useState<TreasureItem | null>(null);
  const [monstersDefeated, setMonstersDefeated] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [battleEffects, setBattleEffects] = useState<BattleEffect[]>([]);
  const battleAreaRef = useRef<HTMLDivElement>(null);

  // สร้างมอนสเตอร์ใหม่
  const generateMonster = () => {
    // ตรวจสอบว่า gameData และ currentArea มีค่าหรือไม่
    if (!gameData || !gameData.currentArea) {
      return {
        name: "สไลม์",
        health: 100,
        maxHealth: 100,
        reward: 10,
        area: "ป่า",
        background: "bg-gradient-to-b from-green-900/50 to-green-700/30",
        itemChance: 0.1,
        image: `/placeholder.svg?height=200&width=200`,
      };
    }

    const areas = {
      ป่า: {
        monsters: ["สไลม์", "หมาป่า", "งูยักษ์", "กระต่ายป่า", "เห็ดมีพิษ"],
        healthRange: [80, 150],
        rewardRange: [10, 25],
        background: "bg-gradient-to-b from-green-900/50 to-green-700/30",
        itemChance: 0.1,
      },
      ถ้ำ: {
        monsters: [
          "ค้างคาวยักษ์",
          "โกเล็ม",
          "แมงมุมยักษ์",
          "โครงกระดูกเดินได้",
          "ทรอลล์",
        ],
        healthRange: [150, 250],
        rewardRange: [25, 50],
        background: "bg-gradient-to-b from-gray-900/50 to-gray-700/30",
        itemChance: 0.15,
      },
      วิหาร: {
        monsters: [
          "ปีศาจ",
          "มัมมี่",
          "ราชันย์ซอมบี้",
          "อสูรเวทมนตร์",
          "ปีศาจไฟ",
        ],
        healthRange: [250, 400],
        rewardRange: [50, 100],
        background: "bg-gradient-to-b from-amber-900/50 to-amber-700/30",
        itemChance: 0.2,
      },
    };

    const currentArea = gameData.currentArea || "ป่า";
    const areaData = areas[currentArea as keyof typeof areas] || areas["ป่า"];

    const monsterName =
      areaData.monsters[Math.floor(Math.random() * areaData.monsters.length)];
    const health =
      Math.floor(
        Math.random() * (areaData.healthRange[1] - areaData.healthRange[0] + 1)
      ) + areaData.healthRange[0];
    const reward =
      Math.floor(
        Math.random() * (areaData.rewardRange[1] - areaData.rewardRange[0] + 1)
      ) + areaData.rewardRange[0];

    return {
      name: monsterName,
      health,
      maxHealth: health,
      reward,
      area: currentArea,
      background: areaData.background,
      itemChance: areaData.itemChance,
      image: `/placeholder.svg?height=200&width=200`,
    };
  };

  // สร้างไอเทมสุ่ม
  const generateRandomItem = () => {
    const rarities = ["ธรรมดา", "ดี", "หายาก", "ตำนาน"];
    const types = ["อาวุธ", "เกราะ", "เครื่องประดับ", "ยา"];
    const prefixes = [
      "แห่งพลัง",
      "แห่งความเร็ว",
      "แห่งปัญญา",
      "แห่งความอึด",
      "แห่งโชค",
    ];

    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

    let name = "";
    const image = "";

    switch (type) {
      case "อาวุธ":
        name = ["ดาบ", "ขวาน", "ค้อน", "หอก", "ธนู"][
          Math.floor(Math.random() * 5)
        ];
        break;
      case "เกราะ":
        name = ["เกราะอก", "หมวก", "ถุงมือ", "รองเท้า", "กางเกง"][
          Math.floor(Math.random() * 5)
        ];
        break;
      case "เครื่องประดับ":
        name = ["แหวน", "สร้อยคอ", "ต่างหู", "เข็มกลัด", "เข็มขัด"][
          Math.floor(Math.random() * 5)
        ];
        break;
      case "ยา":
        name = ["ยาฟื้นพลัง", "ยาเพิ่มพลัง", "ยาป้องกัน", "ยาพิษ", "ยาวิเศษ"][
          Math.floor(Math.random() * 5)
        ];
        break;
    }

    const fullName = `${name}${
      rarity === "ตำนาน" ? "แห่งตำนาน" : rarity === "หายาก" ? prefix : ""
    }`;

    return {
      name: fullName,
      description: `${type}${
        rarity === "ตำนาน" ? "ระดับตำนาน" : ""
      } ที่เพิ่มพลัง${
        type === "อาวุธ"
          ? "โจมตี"
          : type === "เกราะ"
          ? "ป้องกัน"
          : type === "เครื่องประดับ"
          ? "พิเศษ"
          : "ฟื้นฟู"
      }`,
      type: type.toLowerCase(),
      rarity: rarity,
      image: `/placeholder.svg?height=100&width=100`,
    };
  };

  // เริ่มต้นการต่อสู้
  useEffect(() => {
    if (!monster) {
      const newMonster = generateMonster();
      setMonster(newMonster);
      setMonsterHealth(100);
    }
  }, [monster, gameData?.currentArea]);

  // ฟังก์ชันโจมตี
  const handleAttack = () => {
    if (isAttacking || !monster || !gameData) return;

    setIsAttacking(true);

    // คำนวณความเสียหาย
    const baseDamage =
      (gameData.damage || 1) * (gameData.upgrades?.damageMultiplier || 1);
    const damage = baseDamage * comboMultiplier;

    // สร้างตัวเลขความเสียหาย
    const newDamageNumber = {
      id: Date.now(),
      value: Math.floor(damage),
      x: Math.random() * 80 + 10, // ตำแหน่ง X
      y: Math.random() * 80 + 10, // ตำแหน่ง Y
      isCritical: Math.random() < 0.2, // โอกาสคริติคอล 20%
    };

    setDamageNumbers((prev) => [...prev, newDamageNumber]);

    // อัพเดตเลือดมอนสเตอร์
    const newHealthPercent = Math.max(
      0,
      monsterHealth - (damage / monster.maxHealth) * 100
    );
    setMonsterHealth(newHealthPercent);

    // เพิ่ม combo
    increaseCombo();

    // สร้างเอฟเฟกต์การโจมตี
    const newEffect = {
      id: Date.now(),
      type: newDamageNumber.isCritical ? "critical" : "normal",
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
    };

    setBattleEffects((prev) => [...prev, newEffect]);

    // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
    if (newHealthPercent <= 0) {
      // รับรางวัล
      onAttack(monster.reward);
      setCoinsEarned((prev) => prev + monster.reward);

      // เพิ่มจำนวนมอนสเตอร์ที่สังหาร
      setMonstersDefeated((prev) => prev + 1);

      // เรียกใช้ callback onMonsterDefeated ถ้ามี
      if (onMonsterDefeated) {
        onMonsterDefeated();
      }

      // บันทึกประวัติการต่อสู้
      if (gameData.walletAddress) {
        recordBattle(gameData.walletAddress, {
          monstersDefeated: 1,
          coinsEarned: monster.reward,
          itemsFound: 0,
        }).catch((err) => console.error("Error recording battle:", err));
      }

      // สุ่มไอเทม
      if (Math.random() < monster.itemChance) {
        const item = generateRandomItem();
        setTreasureItem(item);
        setShowTreasure(true);

        // แสดงข้อความแจ้งเตือน
        toast.success("พบสมบัติ!", {
          description: `คุณได้รับ ${item.name}`,
        });

        // เล่นเอฟเฟกต์ confetti
        if (battleAreaRef.current) {
          const rect = battleAreaRef.current.getBoundingClientRect();
          confetti({
            particleCount: 100,
            spread: 70,
            origin: {
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height / 2) / window.innerHeight,
            },
          });
        }
      } else {
        // สร้างมอนสเตอร์ใหม่หลังจาก 1 วินาที
        setTimeout(() => {
          setMonster(generateMonster());
          setMonsterHealth(100);
        }, 1000);
      }
    }

    // รีเซ็ตสถานะการโจมตีหลังจาก 0.5 วินาที
    setTimeout(() => {
      setIsAttacking(false);
    }, 500);
  };

  // ฟังก์ชันเพิ่ม combo
  const increaseCombo = () => {
    // เพิ่ม combo
    setComboCount((prev) => prev + 1);

    // อัพเดตตัวคูณ combo
    if (comboCount >= 30) {
      setComboMultiplier(2.0);
    } else if (comboCount >= 20) {
      setComboMultiplier(1.5);
    } else if (comboCount >= 10) {
      setComboMultiplier(1.2);
    }

    // รีเซ็ตตัวจับเวลา combo
    if (comboTimer) {
      clearTimeout(comboTimer);
    }

    // ตั้งเวลารีเซ็ต combo หลังจาก 3 วินาที
    const timer = setTimeout(() => {
      setComboCount(0);
      setComboMultiplier(1);
    }, 3000);

    setComboTimer(timer);
  };

  // ฟังก์ชันรับไอเทม
  const handleClaimItem = () => {
    if (isProcessing || !treasureItem) return;

    // เพิ่มไอเทมในคลัง
    onMintNFT(treasureItem);

    // ปิดหน้าต่างสมบัติ
    setShowTreasure(false);
    setTreasureItem(null);

    // สร้างมอนสเตอร์ใหม่
    setMonster(generateMonster());
    setMonsterHealth(100);
  };

  // ลบตัวเลขความเสียหายหลังจากแสดงผล
  useEffect(() => {
    if (damageNumbers.length > 0) {
      const timer = setTimeout(() => {
        setDamageNumbers((prev) => prev.slice(1));
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [damageNumbers]);

  // ลบเอฟเฟกต์การต่อสู้หลังจากแสดงผล
  useEffect(() => {
    if (battleEffects.length > 0) {
      const timer = setTimeout(() => {
        setBattleEffects((prev) => prev.slice(1));
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [battleEffects]);

  // บันทึกประวัติการต่อสู้เมื่อออกจากหน้า
  useEffect(() => {
    return () => {
      if (
        (monstersDefeated > 0 || coinsEarned > 0) &&
        gameData?.walletAddress
      ) {
        recordBattle(gameData.walletAddress, {
          monstersDefeated,
          coinsEarned,
          itemsFound: 0,
        }).catch((err) =>
          console.error("Error recording battle on unmount:", err)
        );
      }
    };
  }, [monstersDefeated, coinsEarned, gameData?.walletAddress]);

  // ถ้าไม่มีข้อมูลเกม ให้แสดงข้อความโหลด
  if (!gameData) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">กำลังโหลดข้อมูลเกม...</div>
      </div>
    );
  }

  if (!monster) return <div className="p-8 text-center">กำลังโหลด...</div>;

  return (
    <div className="relative p-6" ref={battleAreaRef}>
      {/* พื้นหลังพื้นที่ */}
      <div
        className={`absolute inset-0 ${monster.background} rounded-xl opacity-70`}
      ></div>

      {/* ข้อมูลการต่อสู้ */}
      <div className="relative z-10 flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-purple-500/20 text-purple-300 border-purple-500"
            >
              {monster.area}
            </Badge>
            <span>{monster.name}</span>
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Heart className="h-4 w-4 text-red-400" />
            <Progress value={monsterHealth} className="h-2 w-32" />
            <span className="text-xs">{Math.ceil(monsterHealth)}%</span>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-yellow-400">
            <Coins className="h-4 w-4" />
            <span>{monster.reward}</span>
          </div>

          {comboCount > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Badge
                variant="outline"
                className={`
                ${
                  comboCount >= 30
                    ? "bg-red-500/20 text-red-300 border-red-500"
                    : comboCount >= 20
                    ? "bg-orange-500/20 text-orange-300 border-orange-500"
                    : comboCount >= 10
                    ? "bg-yellow-500/20 text-yellow-300 border-yellow-500"
                    : "bg-blue-500/20 text-blue-300 border-blue-500"
                }
              `}
              >
                <Zap className="h-3 w-3 mr-1" />
                Combo x{comboCount} ({comboMultiplier.toFixed(1)})
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* พื้นที่การต่อสู้ */}
      <div className="relative min-h-[300px] flex items-center justify-center mb-6">
        {/* มอนสเตอร์ */}
        <motion.div
          animate={isAttacking ? { x: [0, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Image
            src={monster.image || "/placeholder.svg"}
            alt={monster.name}
            width={200}
            height={200}
            className="relative z-10"
          />

          {/* ตัวเลขความเสียหาย */}
          <AnimatePresence>
            {damageNumbers.map((damage) => (
              <motion.div
                key={damage.id}
                initial={{ opacity: 1, y: 0, scale: 1 }}
                animate={{
                  opacity: 0,
                  y: -50,
                  scale: damage.isCritical ? 1.5 : 1,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className={`absolute z-20 font-bold ${
                  damage.isCritical
                    ? "text-red-500 text-2xl"
                    : "text-yellow-300 text-xl"
                }`}
                style={{ left: `${damage.x}%`, top: `${damage.y}%` }}
              >
                {damage.value}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* เอฟเฟกต์การต่อสู้ */}
          <AnimatePresence>
            {battleEffects.map((effect) => (
              <motion.div
                key={effect.id}
                initial={{ opacity: 1, scale: 0 }}
                animate={{ opacity: 0, scale: 2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute z-10"
                style={{ left: `${effect.x}%`, top: `${effect.y}%` }}
              >
                {effect.type === "critical" ? (
                  <div className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-red-400" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                    <Sword className="h-5 w-5 text-yellow-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ปุ่มโจมตี */}
      <div className="relative z-10 flex justify-center">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-8 py-6 text-lg font-bold shadow-lg"
            onClick={handleAttack}
            disabled={isAttacking}
          >
            <Sword className="h-6 w-6 mr-2" />
            โจมตี
          </Button>
        </motion.div>
      </div>

      {/* หน้าต่างสมบัติ */}
      <AnimatePresence>
        {showTreasure && treasureItem && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 rounded-xl"
          >
            <div className="bg-gradient-to-b from-amber-900/80 to-yellow-900/80 p-6 rounded-xl border-2 border-yellow-500/50 max-w-md w-full">
              <h3 className="text-xl font-bold text-center mb-4 text-yellow-300">
                พบสมบัติ!
              </h3>

              <div className="flex flex-col items-center mb-6">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                  className="relative w-24 h-24 mb-4"
                >
                  <div className="absolute inset-0 bg-yellow-500/20 rounded-full animate-pulse"></div>
                  <Image
                    src={treasureItem.image || "/placeholder.svg"}
                    alt={treasureItem.name}
                    width={100}
                    height={100}
                    className="relative z-10"
                  />
                </motion.div>

                <h4
                  className={`text-lg font-bold mb-1 
                  ${
                    treasureItem.rarity === "ตำนาน"
                      ? "text-orange-300"
                      : treasureItem.rarity === "หายาก"
                      ? "text-purple-300"
                      : treasureItem.rarity === "ดี"
                      ? "text-blue-300"
                      : "text-gray-300"
                  }`}
                >
                  {treasureItem.name}
                </h4>

                <p className="text-sm text-gray-300 text-center mb-2">
                  {treasureItem.description}
                </p>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`
                    ${
                      treasureItem.rarity === "ตำนาน"
                        ? "bg-orange-500/20 text-orange-300 border-orange-500"
                        : treasureItem.rarity === "หายาก"
                        ? "bg-purple-500/20 text-purple-300 border-purple-500"
                        : treasureItem.rarity === "ดี"
                        ? "bg-blue-500/20 text-blue-300 border-blue-500"
                        : "bg-gray-500/20 text-gray-300 border-gray-500"
                    }
                  `}
                  >
                    {treasureItem.rarity}
                  </Badge>

                  <Badge
                    variant="outline"
                    className="bg-gray-500/20 text-gray-300 border-gray-500"
                  >
                    {treasureItem.type}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-white px-6"
                    onClick={handleClaimItem}
                    disabled={isProcessing}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {treasureItem.rarity === "ตำนาน"
                      ? "สร้าง NFT"
                      : "เก็บไอเทม"}
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
