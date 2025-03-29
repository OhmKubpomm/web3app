"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sword, Skull, Coins, Shield, Sparkles, Zap, Star } from "lucide-react";
import { toast } from "sonner";
import { recordBattle } from "@/lib/actions";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import confetti from "canvas-confetti";
import { useI18n } from "@/lib/i18n";

interface MonsterCardProps {
  gameData: any;
  onDefeat: (reward: number) => void;
  onItemFound?: () => void;
  onExperienceGained?: (characterId: number, amount: number) => void;
  isProcessing: boolean;
}

// ข้อมูลมอนสเตอร์ตามพื้นที่
const MONSTERS = {
  ป่า: [
    { id: 1, name: "สไลม์", hp: 10, reward: 1, xp: 5, color: "green" },
    { id: 2, name: "หมาป่า", hp: 15, reward: 2, xp: 8, color: "gray" },
    { id: 3, name: "งูยักษ์", hp: 20, reward: 3, xp: 10, color: "purple" },
  ],
  ถ้ำ: [
    { id: 4, name: "ค้างคาวยักษ์", hp: 30, reward: 4, xp: 15, color: "black" },
    { id: 5, name: "โกเล็ม", hp: 50, reward: 6, xp: 25, color: "brown" },
    { id: 6, name: "แมงมุมพิษ", hp: 40, reward: 5, xp: 20, color: "red" },
  ],
  ทะเลทราย: [
    { id: 7, name: "แมงป่องยักษ์", hp: 60, reward: 7, xp: 30, color: "yellow" },
    { id: 8, name: "มัมมี่", hp: 70, reward: 8, xp: 35, color: "beige" },
    {
      id: 9,
      name: "จิ้งจอกทะเลทราย",
      hp: 65,
      reward: 7,
      xp: 32,
      color: "orange",
    },
  ],
  ภูเขาไฟ: [
    { id: 10, name: "มังกรไฟ", hp: 100, reward: 12, xp: 50, color: "red" },
    { id: 11, name: "อสูรหิน", hp: 90, reward: 10, xp: 45, color: "gray" },
    { id: 12, name: "ปีศาจลาวา", hp: 85, reward: 9, xp: 42, color: "orange" },
  ],
  forest: [
    { id: 1, name: "Slime", hp: 10, reward: 1, xp: 5, color: "green" },
    { id: 2, name: "Wolf", hp: 15, reward: 2, xp: 8, color: "gray" },
    { id: 3, name: "Giant Snake", hp: 20, reward: 3, xp: 10, color: "purple" },
  ],
  cave: [
    { id: 4, name: "Giant Bat", hp: 30, reward: 4, xp: 15, color: "black" },
    { id: 5, name: "Golem", hp: 50, reward: 6, xp: 25, color: "brown" },
    { id: 6, name: "Poison Spider", hp: 40, reward: 5, xp: 20, color: "red" },
  ],
  desert: [
    {
      id: 7,
      name: "Giant Scorpion",
      hp: 60,
      reward: 7,
      xp: 30,
      color: "yellow",
    },
    { id: 8, name: "Mummy", hp: 70, reward: 8, xp: 35, color: "beige" },
    { id: 9, name: "Desert Fox", hp: 65, reward: 7, xp: 32, color: "orange" },
  ],
  volcano: [
    { id: 10, name: "Fire Dragon", hp: 100, reward: 12, xp: 50, color: "red" },
    { id: 11, name: "Stone Demon", hp: 90, reward: 10, xp: 45, color: "gray" },
    { id: 12, name: "Lava Fiend", hp: 85, reward: 9, xp: 42, color: "orange" },
  ],
};

// แปลงชื่อพื้นที่ภาษาไทยเป็นอังกฤษ
const AREA_TRANSLATION: Record<string, string> = {
  ป่า: "forest",
  ถ้ำ: "cave",
  ทะเลทราย: "desert",
  ภูเขาไฟ: "volcano",
  forest: "forest",
  cave: "cave",
  desert: "desert",
  volcano: "volcano",
};

export default function MonsterCard({
  gameData,
  onDefeat,
  onItemFound,
  onExperienceGained,
  isProcessing,
}: MonsterCardProps) {
  const { locale } = useI18n();
  const { address, attackMonster, multiAttack, gainExperience } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const [currentMonster, setCurrentMonster] = useState<any>(null);
  const [monsterHP, setMonsterHP] = useState(0);
  const [maxHP, setMaxHP] = useState(0);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [damageValue, setDamageValue] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [rewardValue, setRewardValue] = useState(0);
  const [xpValue, setXpValue] = useState(0);
  const [attackCount, setAttackCount] = useState(1); // จำนวนการโจมตีต่อครั้ง
  const [particles, setParticles] = useState<
    { x: number; y: number; size: number; opacity: number; color: string }[]
  >([]);
  const [foundItem, setFoundItem] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [monsterDefeated, setMonsterDefeated] = useState(false);
  const [spawnTimeout, setSpawnTimeout] = useState<NodeJS.Timeout | null>(null);
  const [autoAttackInterval, setAutoAttackInterval] =
    useState<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const monsterRef = useRef<HTMLDivElement>(null);

  // ตั้งค่า mounted เมื่อ component ถูกโหลด
  useEffect(() => {
    setMounted(true);

    // ตั้งค่าโจมตีอัตโนมัติเมื่อ component โหลด
    const intervalId = setInterval(() => {
      if (
        gameData?.autoDamage &&
        currentMonster &&
        monsterHP > 0 &&
        !monsterDefeated
      ) {
        // คำนวณดาเมจจาก autoDamage
        const autoDamage = gameData.autoDamage || 0;
        if (autoDamage > 0) {
          setDamageValue(autoDamage);
          setShowDamage(true);

          // ลด HP มอนสเตอร์
          const newHP = Math.max(0, monsterHP - autoDamage);
          setMonsterHP(newHP);

          // ซ่อนดาเมจหลังจาก 1 วินาที
          setTimeout(() => {
            setShowDamage(false);
          }, 1000);

          // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
          if (newHP <= 0) {
            handleMonsterDefeat();
          }
        }
      }
    }, 1000);

    setAutoAttackInterval(intervalId);

    return () => {
      // เมื่อ component ถูก unmount ให้ล้าง interval
      if (autoAttackInterval) {
        clearInterval(autoAttackInterval);
      }
      if (spawnTimeout) {
        clearTimeout(spawnTimeout);
      }
    };
  }, [
    mounted,
    gameData?.autoDamage,
    monsterHP,
    currentMonster,
    monsterDefeated,
  ]);

  // สุ่มมอนสเตอร์ตามพื้นที่
  const spawnMonster = () => {
    if (!gameData) return;

    const currentArea = gameData.currentArea || "ป่า";
    const translatedArea = AREA_TRANSLATION[currentArea] || currentArea;

    // เลือกชุดข้อมูลมอนสเตอร์ตามภาษา
    const areaMonsters =
      locale === "th"
        ? MONSTERS[currentArea as keyof typeof MONSTERS] || MONSTERS["ป่า"]
        : MONSTERS[translatedArea as keyof typeof MONSTERS] ||
          MONSTERS["forest"];

    if (!areaMonsters || areaMonsters.length === 0) {
      console.error("No monsters found for area:", currentArea);
      return;
    }

    const randomIndex = Math.floor(Math.random() * areaMonsters.length);
    const monster = { ...areaMonsters[randomIndex] };

    // ปรับความยากตามเลเวลของผู้เล่น
    const playerLevel = Math.max(
      ...(gameData?.characters?.map((c: any) => c.level) || [1])
    );
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

    monster.hp = Math.floor(
      monster.hp * (1 + (playerLevel - 1) * 0.2) * areaMultiplier
    );
    monster.reward = Math.floor(
      monster.reward * (1 + (playerLevel - 1) * 0.1) * areaMultiplier
    );
    monster.xp = Math.floor(
      monster.xp * (1 + (playerLevel - 1) * 0.1) * areaMultiplier
    );

    setCurrentMonster(monster);
    setMonsterHP(monster.hp);
    setMaxHP(monster.hp);
    setShowReward(false);
    setFoundItem(null);
    setMonsterDefeated(false);
  };

  // สร้าง particles เมื่อโจมตี
  const createParticles = (count = 10) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const newParticles: {
      x: number;
      y: number;
      size: number;
      opacity: number;
      color: string;
    }[] = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50 + 20;

      newParticles.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        size: Math.random() * 6 + 2,
        opacity: 1,
        color: getMonsterColor(0.8),
      });
    }

    setParticles((prev) => [...prev, ...newParticles]);

    // ลบ particles หลังจาก 1 วินาที
    setTimeout(() => {
      setParticles((prev) => prev.slice(count));
    }, 1000);
  };

  // สุ่มไอเทม
  const generateRandomItem = () => {
    const rarities = ["common", "uncommon", "rare", "epic", "legendary"];
    const types = ["weapon", "armor", "accessory"];

    // สุ่มความหายากโดยให้ของหายากมีโอกาสน้อยกว่า
    const rarityChances = [0.5, 0.25, 0.15, 0.07, 0.03]; // รวมเป็น 1
    let rarityIndex = 0;
    const rarityRoll = Math.random();
    let cumulativeChance = 0;

    for (let i = 0; i < rarityChances.length; i++) {
      cumulativeChance += rarityChances[i];
      if (rarityRoll <= cumulativeChance) {
        rarityIndex = i;
        break;
      }
    }

    const rarity = rarities[rarityIndex];
    const type = types[Math.floor(Math.random() * types.length)];

    // สร้างชื่อไอเทมตามประเภทและความหายาก
    let name = "";
    switch (type) {
      case "weapon":
        name =
          locale === "th"
            ? ["ดาบ", "ขวาน", "ค้อน", "หอก", "ธนู"][
                Math.floor(Math.random() * 5)
              ]
            : ["Sword", "Axe", "Hammer", "Spear", "Bow"][
                Math.floor(Math.random() * 5)
              ];
        break;
      case "armor":
        name =
          locale === "th"
            ? ["เกราะอก", "หมวก", "ถุงมือ", "รองเท้า", "กางเกง"][
                Math.floor(Math.random() * 5)
              ]
            : ["Chestplate", "Helmet", "Gloves", "Boots", "Leggings"][
                Math.floor(Math.random() * 5)
              ];
        break;
      case "accessory":
        name =
          locale === "th"
            ? ["แหวน", "สร้อยคอ", "ต่างหู", "เข็มกลัด", "เข็มขัด"][
                Math.floor(Math.random() * 5)
              ]
            : ["Ring", "Necklace", "Earring", "Brooch", "Belt"][
                Math.floor(Math.random() * 5)
              ];
        break;
    }

    // เพิ่มคำขยายตามความหายาก
    if (locale === "th") {
      if (rarity === "legendary") {
        name = `${name}แห่งตำนาน`;
      } else if (rarity === "epic") {
        name = `${name}มหากาพย์`;
      } else if (rarity === "rare") {
        name = `${name}หายาก`;
      } else if (rarity === "uncommon") {
        name = `${name}พิเศษ`;
      }
    } else {
      if (rarity === "legendary") {
        name = `Legendary ${name}`;
      } else if (rarity === "epic") {
        name = `Epic ${name}`;
      } else if (rarity === "rare") {
        name = `Rare ${name}`;
      } else if (rarity === "uncommon") {
        name = `Uncommon ${name}`;
      } else {
        name = `Common ${name}`;
      }
    }

    let description = "";
    if (locale === "th") {
      description = `${
        type === "weapon"
          ? "อาวุธ"
          : type === "armor"
          ? "เกราะ"
          : "เครื่องประดับ"
      }${rarity === "legendary" ? "ระดับตำนาน" : ""} ที่เพิ่มพลัง${
        type === "weapon" ? "โจมตี" : type === "armor" ? "ป้องกัน" : "พิเศษ"
      }`;
    } else {
      description = `A ${rarity} ${
        type === "weapon" ? "weapon" : type === "armor" ? "armor" : "accessory"
      } that increases ${
        type === "weapon" ? "attack" : type === "armor" ? "defense" : "special"
      } power`;
    }

    return {
      name,
      description,
      type,
      rarity,
      image: `/placeholder.svg?height=100&width=100`,
    };
  };

  // จัดการเมื่อมอนสเตอร์ตาย
  const handleMonsterDefeat = async () => {
    if (monsterDefeated || !currentMonster) return;

    setMonsterDefeated(true);
    const actualAddress = address || wagmiAddress;

    // รับรางวัลและประสบการณ์
    const reward = currentMonster.reward;
    const xp = currentMonster.xp;

    onDefeat(reward);
    setRewardValue(reward);
    setXpValue(xp);
    setShowReward(true);

    // ถ้ามีตัวละคร ให้เพิ่มประสบการณ์
    if (
      gameData.characters &&
      gameData.characters.length > 0 &&
      actualAddress
    ) {
      const mainCharacter = gameData.characters[0];

      try {
        // เรียกใช้ฟังก์ชันเพิ่มประสบการณ์จาก contract
        const expResult = await gainExperience(mainCharacter.id, xp);

        // ถ้ามีการเลเวลอัพ
        if (expResult && expResult.newLevel) {
          // แสดง confetti
          if (containerRef.current) {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: {
                x: 0.5,
                y: 0.5,
              },
              zIndex: 999,
            });
          }

          // แสดงข้อความเลเวลอัพ
          toast.success(locale === "th" ? "เลเวลอัพ!" : "Level Up!", {
            description:
              locale === "th"
                ? `${mainCharacter.name} เลเวลอัพเป็นระดับ ${
                    mainCharacter.level + 1
                  }!`
                : `${mainCharacter.name} leveled up to level ${
                    mainCharacter.level + 1
                  }!`,
            position: "top-center",
          });
        }

        // ส่งข้อมูลประสบการณ์กลับไปยัง parent component
        if (onExperienceGained) {
          onExperienceGained(mainCharacter.id, xp);
        }
      } catch (error) {
        console.error("Error gaining experience:", error);
      }
    }

    // บันทึกการต่อสู้
    if (actualAddress) {
      recordBattle(actualAddress, {
        monstersDefeated: 1,
        coinsEarned: reward,
        itemsFound: 0,
        xpGained: xp,
      }).catch((err) => console.error("Error recording battle:", err));
    }

    // สุ่มไอเทม (โอกาส 15%)
    if (Math.random() < 0.15) {
      const item = generateRandomItem();
      setFoundItem(item);
      if (onItemFound) onItemFound();

      // เล่นเอฟเฟกต์ confetti
      if (containerRef.current) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: {
            x: 0.5,
            y: 0.5,
          },
        });
      }

      toast.success(locale === "th" ? "พบไอเทม!" : "Item found!", {
        description:
          locale === "th"
            ? `คุณได้รับ ${item.name}`
            : `You received ${item.name}`,
        position: "top-right",
      });
    } else {
      // สร้างมอนสเตอร์ใหม่หลังจาก 2 วินาที
      const timeout = setTimeout(() => {
        spawnMonster();
      }, 2000);

      setSpawnTimeout(timeout);
    }
  };

  // ฟังก์ชันโจมตี
  const handleAttack = async () => {
    if (
      isAttacking ||
      isProcessing ||
      monsterHP <= 0 ||
      !currentMonster ||
      !mounted ||
      monsterDefeated
    )
      return;

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

    setIsAttacking(true);

    // สร้าง particles
    createParticles(10);

    try {
      // เรียกใช้ฟังก์ชัน attackMonster จาก contract
      const result = await attackMonster(currentMonster.id);

      if (result) {
        // แสดงดาเมจ
        setDamageValue(result.damage);
        setShowDamage(true);

        // ลด HP มอนสเตอร์
        const newHP = Math.max(0, monsterHP - result.damage);
        setMonsterHP(newHP);

        // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
        if (newHP <= 0 || result.defeated) {
          handleMonsterDefeat();
        }
      } else {
        // ถ้าไม่มีผลลัพธ์จาก contract ให้ใช้ค่าเริ่มต้น
        const damage = gameData?.damage || 1;
        setDamageValue(damage);
        setShowDamage(true);

        // ลด HP มอนสเตอร์
        const newHP = Math.max(0, monsterHP - damage);
        setMonsterHP(newHP);

        // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
        if (newHP <= 0) {
          handleMonsterDefeat();
        }
      }
    } catch (error) {
      console.error("Error attacking monster:", error);
      toast.error(
        locale === "th"
          ? "ไม่สามารถโจมตีมอนสเตอร์ได้"
          : "Failed to attack monster",
        {
          description:
            locale === "th" ? "กรุณาลองใหม่อีกครั้ง" : "Please try again",
          position: "top-right",
        }
      );
    }

    // ซ่อนดาเมจหลังจาก 1 วินาที
    setTimeout(() => {
      setShowDamage(false);
      setIsAttacking(false);
    }, 1000);
  };

  // ฟังก์ชันโจมตีหลายครั้ง
  const handleMultiAttack = async () => {
    if (
      isAttacking ||
      isProcessing ||
      monsterHP <= 0 ||
      !currentMonster ||
      !mounted ||
      monsterDefeated
    )
      return;

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

    setIsAttacking(true);

    // สร้าง particles
    createParticles(attackCount * 5);

    try {
      // เรียกใช้ฟังก์ชัน multiAttack จาก contract
      const result = await multiAttack(attackCount);

      if (result) {
        // แสดงดาเมจ
        setDamageValue(result.totalDamage);
        setShowDamage(true);

        // ลด HP มอนสเตอร์
        const newHP = Math.max(0, monsterHP - result.totalDamage);
        setMonsterHP(newHP);

        // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
        if (newHP <= 0 || result.monstersDefeated > 0) {
          handleMonsterDefeat();
        }
      } else {
        // ถ้าไม่มีผลลัพธ์จาก contract ให้ใช้ค่าเริ่มต้น
        const damage = (gameData?.damage || 1) * attackCount;
        setDamageValue(damage);
        setShowDamage(true);

        // ลด HP มอนสเตอร์
        const newHP = Math.max(0, monsterHP - damage);
        setMonsterHP(newHP);

        // ตรวจสอบว่ามอนสเตอร์ตายหรือไม่
        if (newHP <= 0) {
          handleMonsterDefeat();
        }
      }
    } catch (error) {
      console.error("Error multi-attacking:", error);
      toast.error(
        locale === "th"
          ? "ไม่สามารถโจมตีมอนสเตอร์ได้"
          : "Failed to attack monster",
        {
          description:
            locale === "th" ? "กรุณาลองใหม่อีกครั้ง" : "Please try again",
          position: "top-right",
        }
      );
    }

    // ซ่อนดาเมจหลังจาก 1 วินาที
    setTimeout(() => {
      setShowDamage(false);
      setIsAttacking(false);
    }, 1000);
  };

  // สร้างมอนสเตอร์เมื่อเริ่มต้น
  useEffect(() => {
    if (mounted && gameData && !currentMonster) {
      spawnMonster();
    }
  }, [gameData?.currentArea, mounted, gameData, currentMonster]);

  // ฟังก์ชันรับไอเทม
  const handleClaimItem = () => {
    // เพิ่มไอเทมในคลัง (ในเกมจริงควรเรียก API)
    toast.success(locale === "th" ? "ได้รับไอเทม!" : "Item received!", {
      description:
        locale === "th"
          ? `คุณได้รับ ${foundItem.name} แล้ว`
          : `You received ${foundItem.name}`,
      position: "top-right",
    });

    // รีเซ็ตและสร้างมอนสเตอร์ใหม่
    setFoundItem(null);
    setShowReward(false);
    spawnMonster();
  };

  // สร้างสีตามประเภทมอนสเตอร์
  const getMonsterColor = (opacity = 1) => {
    if (!currentMonster) return `rgba(147, 51, 234, ${opacity})`;

    switch (currentMonster.color) {
      case "green":
        return `rgba(22, 163, 74, ${opacity})`;
      case "gray":
        return `rgba(107, 114, 128, ${opacity})`;
      case "purple":
        return `rgba(147, 51, 234, ${opacity})`;
      case "black":
        return `rgba(31, 41, 55, ${opacity})`;
      case "brown":
        return `rgba(180, 83, 9, ${opacity})`;
      case "red":
        return `rgba(220, 38, 38, ${opacity})`;
      case "yellow":
        return `rgba(202, 138, 4, ${opacity})`;
      case "beige":
        return `rgba(245, 158, 11, ${opacity})`;
      case "orange":
        return `rgba(234, 88, 12, ${opacity})`;
      default:
        return `rgba(147, 51, 234, ${opacity})`;
    }
  };

  // ถ้าไม่มีข้อมูลเกม ให้แสดงข้อความโหลด
  if (!gameData) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse">
          {locale === "th" ? "กำลังโหลดข้อมูลเกม..." : "Loading game data..."}
        </div>
      </div>
    );
  }

  if (!currentMonster || !mounted)
    return (
      <div className="p-8 text-center">
        {locale === "th" ? "กำลังโหลด..." : "Loading..."}
      </div>
    );

  return (
    <Card className="border-purple-500/50 bg-gradient-to-b from-gray-900 to-black overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold">
              {currentMonster?.name ||
                (locale === "th" ? "มอนสเตอร์" : "Monster")}
            </h2>
            <div className="text-sm text-gray-400">
              {locale === "th" ? "พื้นที่: " : "Area: "}
              {gameData?.currentArea || (locale === "th" ? "ป่า" : "Forest")}
            </div>
          </div>

          <div
            ref={containerRef}
            className="relative h-60 flex items-center justify-center mb-4 overflow-hidden bg-black/30 rounded-lg border border-purple-500/20"
          >
            {/* พื้นหลังเอฟเฟกต์ */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: `radial-gradient(circle, ${getMonsterColor(
                  0.3
                )} 0%, rgba(0,0,0,0) 70%)`,
              }}
            />

            {/* Particles */}
            {particles.map((particle, index) => (
              <motion.div
                key={index}
                initial={{
                  x: particle.x,
                  y: particle.y,
                  opacity: particle.opacity,
                  scale: 0,
                }}
                animate={{
                  opacity: [particle.opacity, 0],
                  scale: [0, 1],
                  y: particle.y - 20,
                }}
                transition={{ duration: 1 }}
                className="absolute rounded-full"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  left: 0,
                  top: 0,
                  transform: `translate(${particle.x}px, ${particle.y}px)`,
                }}
              />
            ))}

            {/* มอนสเตอร์ */}
            <motion.div
              ref={monsterRef}
              animate={{
                scale: isAttacking ? 0.95 : 1,
                rotate: isAttacking ? [-5, 5, 0] : 0,
              }}
              transition={{ duration: 0.2 }}
              className="relative cursor-pointer"
              onClick={monsterDefeated ? undefined : handleAttack}
            >
              <div className="relative">
                {/* เงามอนสเตอร์ */}
                <div
                  className="absolute -inset-4 rounded-full blur-xl opacity-30"
                  style={{ backgroundColor: getMonsterColor() }}
                />

                {/* ตัวมอนสเตอร์ */}
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 2, 0, -2, 0],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                  className="relative z-10 w-32 h-32 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: getMonsterColor() }}
                >
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{
                        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)`,
                      }}
                    />
                  </div>

                  <div className="relative">
                    <Skull className="h-16 w-16 text-white" />

                    {/* แสดงดาเมจ */}
                    <AnimatePresence>
                      {showDamage && (
                        <motion.div
                          initial={{ opacity: 0, y: 0, scale: 0.5 }}
                          animate={{ opacity: 1, y: -40, scale: 1.2 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-0 left-1/2 -translate-x-1/2 font-bold text-xl"
                          style={{
                            color: "white",
                            textShadow:
                              "0 0 5px rgba(220, 38, 38, 1), 0 0 10px rgba(220, 38, 38, 0.8)",
                          }}
                        >
                          -{damageValue}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* แสดงรางวัล */}
            <AnimatePresence>
              {showReward && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg"
                >
                  <div className="text-center">
                    <motion.h3
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold mb-4 text-white"
                    >
                      {locale === "th" ? "ชัยชนะ!" : "Victory!"}
                    </motion.h3>
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4, type: "spring" }}
                      className="flex flex-col items-center justify-center gap-2"
                    >
                      <div className="flex items-center gap-2 bg-black/50 px-6 py-3 rounded-full border border-yellow-500/30 mb-2">
                        <Coins className="h-6 w-6 text-yellow-400" />
                        <span className="text-2xl font-bold text-yellow-300">
                          +{rewardValue}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/50 px-6 py-3 rounded-full border border-purple-500/30">
                        <Star className="h-6 w-6 text-purple-400" />
                        <span className="text-2xl font-bold text-purple-300">
                          +{xpValue}
                        </span>
                      </div>
                    </motion.div>

                    {/* แสดงไอเทมที่พบ */}
                    {foundItem && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-4"
                      >
                        <div className="bg-black/50 p-4 rounded-lg border border-purple-500/30">
                          <h4 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                            <span>
                              {locale === "th" ? "พบไอเทม!" : "Item found!"}
                            </span>
                          </h4>

                          <div className="flex items-center gap-3 mb-3">
                            <div className="relative">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  foundItem.rarity === "legendary"
                                    ? "bg-orange-600/30"
                                    : foundItem.rarity === "epic"
                                    ? "bg-purple-600/30"
                                    : foundItem.rarity === "rare"
                                    ? "bg-blue-600/30"
                                    : foundItem.rarity === "uncommon"
                                    ? "bg-green-600/30"
                                    : "bg-gray-600/30"
                                }`}
                              >
                                {foundItem.type === "weapon" && (
                                  <Sword className="h-6 w-6 text-white" />
                                )}
                                {foundItem.type === "armor" && (
                                  <Shield className="h-6 w-6 text-white" />
                                )}
                                {foundItem.type === "accessory" && (
                                  <Sparkles className="h-6 w-6 text-white" />
                                )}
                              </div>
                            </div>

                            <div className="text-left">
                              <p className="font-bold">{foundItem.name}</p>
                              <p className="text-xs text-gray-300">
                                {foundItem.description}
                              </p>
                            </div>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium"
                            onClick={handleClaimItem}
                          >
                            {locale === "th" ? "รับไอเทม" : "Claim Item"}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>HP</span>
              <span>
                {monsterHP}/{maxHP}
              </span>
            </div>
            <Progress
              value={(monsterHP / maxHP) * 100}
              className={`h-2 bg-gray-800 ${
                monsterHP < maxHP * 0.3
                  ? "bg-gradient-to-r from-red-600 to-red-400"
                  : monsterHP < maxHP * 0.6
                  ? "bg-gradient-to-r from-orange-600 to-orange-400"
                  : "bg-gradient-to-r from-green-600 to-green-400"
              }`}
            />

            <div className="flex justify-between text-sm mt-4">
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                <Sword className="h-4 w-4 text-red-400" />
                <span>{gameData?.damage || 1}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                <Shield className="h-4 w-4 text-blue-400" />
                <span>{currentMonster?.hp || 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span>{currentMonster?.reward || 0}</span>
              </div>
              <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full">
                <Star className="h-4 w-4 text-purple-400" />
                <span>{currentMonster?.xp || 0}</span>
              </div>
            </div>
          </div>

          {/* ปุ่มโจมตี */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-bold shadow-lg"
              onClick={handleAttack}
              disabled={isAttacking || isProcessing || monsterDefeated}
            >
              <Sword className="h-5 w-5 mr-2" />
              {isAttacking
                ? locale === "th"
                  ? "กำลังโจมตี..."
                  : "Attacking..."
                : locale === "th"
                ? "โจมตี"
                : "Attack"}
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold shadow-lg"
                onClick={handleMultiAttack}
                disabled={isAttacking || isProcessing || monsterDefeated}
              >
                <Zap className="h-5 w-5 mr-2" />
                {isAttacking
                  ? locale === "th"
                    ? "กำลังโจมตี..."
                    : "Attacking..."
                  : locale === "th"
                  ? `โจมตี x${attackCount}`
                  : `Attack x${attackCount}`}
              </Button>

              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 border-purple-500/30"
                  onClick={() => setAttackCount(Math.min(attackCount + 1, 10))}
                  disabled={
                    attackCount >= 10 ||
                    isAttacking ||
                    isProcessing ||
                    monsterDefeated
                  }
                >
                  +
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8 border-purple-500/30"
                  onClick={() => setAttackCount(Math.max(attackCount - 1, 1))}
                  disabled={
                    attackCount <= 1 ||
                    isAttacking ||
                    isProcessing ||
                    monsterDefeated
                  }
                >
                  -
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
