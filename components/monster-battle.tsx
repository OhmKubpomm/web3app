"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sword, Sparkles } from "lucide-react";
import Image from "next/image";

interface MonsterBattleProps {
  area: string;
  onAttack: () => void;
  damage: number;
  autoDamage: number;
}

export default function MonsterBattle({
  area,
  onAttack,
  damage,
  autoDamage,
}: MonsterBattleProps) {
  const [monster, setMonster] = useState({
    name: "สไลม์",
    maxHealth: 10,
    currentHealth: 10,
    image: "/placeholder.svg?height=200&width=200",
  });
  const [isAttacking, setIsAttacking] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [damagePosition, setDamagePosition] = useState({ x: 0, y: 0 });

  // สร้างมอนสเตอร์ใหม่เมื่อเปลี่ยนพื้นที่หรือมอนสเตอร์ตาย
  const generateMonster = () => {
    const monsters = {
      ป่า: [
        {
          name: "สไลม์",
          maxHealth: 10,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "หมาป่า",
          maxHealth: 15,
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
      ถ้ำ: [
        {
          name: "ค้างคาวยักษ์",
          maxHealth: 25,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "โกเล็ม",
          maxHealth: 40,
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
      วิหารโบราณ: [
        {
          name: "มัมมี่",
          maxHealth: 60,
          image: "/placeholder.svg?height=200&width=200",
        },
        {
          name: "ปีศาจโบราณ",
          maxHealth: 100,
          image: "/placeholder.svg?height=200&width=200",
        },
      ],
    };

    const areaMonsters =
      monsters[area as keyof typeof monsters] || monsters["ป่า"];
    const randomMonster =
      areaMonsters[Math.floor(Math.random() * areaMonsters.length)];

    setMonster({
      ...randomMonster,
      currentHealth: randomMonster.maxHealth,
    });
  };

  // เปลี่ยนมอนสเตอร์เมื่อเปลี่ยนพื้นที่
  useEffect(() => {
    generateMonster();
  }, [area]);

  // ระบบโจมตีอัตโนมัติ
  useEffect(() => {
    if (autoDamage <= 0) return;

    const interval = setInterval(() => {
      handleAttack(true);
    }, 1000);

    return () => clearInterval(interval);
  }, [autoDamage, monster]);

  // ฟังก์ชันโจมตีมอนสเตอร์
  const handleAttack = (isAuto = false) => {
    const attackDamage = isAuto ? autoDamage : damage;

    if (!isAuto) {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 300);
    }

    // สุ่มตำแหน่งแสดงความเสียหาย
    setDamagePosition({
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
    });
    setShowDamage(true);
    setTimeout(() => setShowDamage(false), 500);

    // ลดเลือดมอนสเตอร์
    const newHealth = Math.max(0, monster.currentHealth - attackDamage);
    setMonster((prev) => ({
      ...prev,
      currentHealth: newHealth,
    }));

    // ถ้ามอนสเตอร์ตาย
    if (newHealth <= 0) {
      setTimeout(() => {
        onAttack();
        generateMonster();
      }, 500);
    } else if (!isAuto) {
      onAttack();
    }
  };

  const healthPercentage = (monster.currentHealth / monster.maxHealth) * 100;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 w-full">
        <div className="flex justify-between mb-1 text-sm">
          <span>{monster.name}</span>
          <span>
            {monster.currentHealth}/{monster.maxHealth} HP
          </span>
        </div>
        <Progress value={healthPercentage} className="h-2" />
      </div>

      <div className="relative w-64 h-64 mb-6">
        <motion.div
          animate={
            isAttacking
              ? { scale: 0.95, opacity: 0.8 }
              : { scale: 1, opacity: 1 }
          }
          className="relative"
        >
          <Image
            src={monster.image || "/placeholder.svg"}
            alt={monster.name}
            width={200}
            height={200}
            className="mx-auto"
          />

          <AnimatePresence>
            {showDamage && (
              <motion.div
                initial={{ opacity: 0, y: 0, x: damagePosition.x }}
                animate={{
                  opacity: 1,
                  y: damagePosition.y - 20,
                  x: damagePosition.x,
                }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-xl"
              >
                -{damage}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="flex gap-4">
        <Button
          size="lg"
          className="bg-red-600 hover:bg-red-700 text-white px-8"
          onClick={() => handleAttack()}
        >
          <Sword className="mr-2 h-5 w-5" />
          โจมตี
        </Button>

        {autoDamage > 0 && (
          <Button
            variant="outline"
            size="lg"
            className="border-yellow-500 text-yellow-400"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            อัตโนมัติ: {autoDamage}/วิ
          </Button>
        )}
      </div>
    </div>
  );
}
