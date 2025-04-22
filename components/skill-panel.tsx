"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skill } from "@/lib/simulation-mode";
import { useWeb3 } from "@/lib/web3-client";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { Zap, BookOpen, Sword, Coins, Sparkles, StarIcon, Lock } from "lucide-react";

interface SkillPanelProps {
  playerData: any;
  onUpgradeSkill: (skillId: number) => Promise<any>;
}

export default function SkillPanel({ playerData, onUpgradeSkill }: SkillPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [upgrading, setUpgrading] = useState<number | null>(null);
  const { t, locale } = useI18n();
  
  if (!playerData || !playerData.skills) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{locale === 'th' ? 'ทักษะ' : 'Skills'}</CardTitle>
          <CardDescription>{locale === 'th' ? 'กำลังโหลดข้อมูล...' : 'Loading skill data...'}</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  // ฟังก์ชันเพื่อแสดงไอคอนของทักษะ
  const getSkillIcon = (effect: string) => {
    switch (effect) {
      case 'damage': return <Sword className="w-5 h-5 text-red-500" />;
      case 'dropRate': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'critChance': return <Zap className="w-5 h-5 text-yellow-500" />;
      case 'experience': return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'coins': return <Coins className="w-5 h-5 text-green-500" />;
      default: return <StarIcon className="w-5 h-5 text-gray-500" />;
    }
  };
  
  // ฟังก์ชันอัพเกรดทักษะ
  const handleUpgradeSkill = async (skillId: number) => {
    if (isLoading) return;
    
    const skill = playerData.skills.find((s: Skill) => s.id === skillId);
    const upgradeCost = skill.cost * (skill.level + 1);
    
    // ตรวจสอบว่าเหรียญพอหรือไม่
    if (playerData.coins < upgradeCost) {
      toast.error(locale === 'th' ? 'เหรียญไม่เพียงพอ' : 'Not enough coins', {
        description: locale === 'th' 
          ? `ต้องการ ${upgradeCost} เหรียญ` 
          : `You need ${upgradeCost} coins`
      });
      return;
    }
    
    // ตรวจสอบว่าทักษะถึงระดับสูงสุดแล้วหรือไม่
    if (skill.level >= skill.maxLevel) {
      toast.error(locale === 'th' ? 'ทักษะอยู่ในระดับสูงสุดแล้ว' : 'Skill already at max level');
      return;
    }
    
    try {
      setIsLoading(true);
      setUpgrading(skillId);
      
      const result = await onUpgradeSkill(skillId);
      
      if (result.success) {
        toast.success(
          locale === 'th' ? 'อัพเกรดทักษะสำเร็จ' : 'Skill upgraded successfully',
          {
            description: locale === 'th'
              ? `${skill.name} เพิ่มเป็นระดับ ${result.newLevel}`
              : `${skill.name} increased to level ${result.newLevel}`
          }
        );
      } else {
        toast.error(
          locale === 'th' ? 'อัพเกรดทักษะล้มเหลว' : 'Failed to upgrade skill',
          { description: result.error }
        );
      }
    } catch (error) {
      console.error('Error upgrading skill:', error);
      toast.error(
        locale === 'th' ? 'เกิดข้อผิดพลาดในการอัพเกรดทักษะ' : 'Error upgrading skill'
      );
    } finally {
      setIsLoading(false);
      setUpgrading(null);
    }
  };
  
  // จัดกลุ่มทักษะตามประเภท
  const sortedSkills = [...playerData.skills].sort((a: Skill, b: Skill) => a.id - b.id);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{locale === 'th' ? 'ทักษะ' : 'Skills'}</CardTitle>
        <CardDescription>
          {locale === 'th' 
            ? 'อัพเกรดทักษะเพื่อเพิ่มความแข็งแกร่งให้ตัวละคร' 
            : 'Upgrade skills to strengthen your character'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedSkills.map((skill: Skill) => (
            <motion.div
              key={skill.id}
              className="border rounded-lg p-4 flex flex-col relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  {getSkillIcon(skill.effect.target)}
                  <h3 className="text-lg font-medium ml-2">
                    {skill.name}
                  </h3>
                </div>
                <div className="flex items-center bg-primary/10 px-2 py-1 rounded text-sm">
                  <span className="mr-1">Lv.</span>
                  <span className={`font-bold ${skill.level === skill.maxLevel ? 'text-amber-500' : 'text-primary'}`}>
                    {skill.level}/{skill.maxLevel}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {skill.description}
              </p>
              
              <div className="mt-auto">
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      {locale === 'th' ? 'ผลกระทบ:' : 'Effect:'} 
                      <span className="font-medium ml-1">
                        {skill.effect.value * skill.level}
                        {skill.effect.target === 'critChance' || skill.effect.target === 'dropRate' ? '%' : ''}
                      </span>
                    </span>
                    <span>
                      {locale === 'th' ? 'ถัดไป:' : 'Next:'} 
                      <span className="font-medium ml-1">
                        {skill.effect.value * (skill.level + 1)}
                        {skill.effect.target === 'critChance' || skill.effect.target === 'dropRate' ? '%' : ''}
                      </span>
                    </span>
                  </div>
                  <Progress 
                    value={(skill.level / skill.maxLevel) * 100} 
                    className="h-1.5" 
                  />
                </div>
                
                <Button
                  variant={skill.level >= skill.maxLevel ? "outline" : "default"}
                  size="sm"
                  className="w-full"
                  disabled={isLoading || skill.level >= skill.maxLevel}
                  onClick={() => handleUpgradeSkill(skill.id)}
                >
                  {upgrading === skill.id ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {locale === 'th' ? 'กำลังอัพเกรด...' : 'Upgrading...'}
                    </span>
                  ) : skill.level >= skill.maxLevel ? (
                    <span className="flex items-center">
                      <StarIcon className="mr-1 h-4 w-4" />
                      {locale === 'th' ? 'ระดับสูงสุด' : 'Max Level'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Coins className="mr-1 h-4 w-4" />
                      {locale === 'th' ? 'อัพเกรด' : 'Upgrade'} ({skill.cost * (skill.level + 1)})
                    </span>
                  )}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 