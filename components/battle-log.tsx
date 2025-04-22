"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { Sword, Shield, Zap, Coins, Sparkles, Trophy, Calendar } from "lucide-react";

// Define the BattleLogEntry interface
interface BattleLogEntry {
  timestamp: string;
  monsterName: string;
  area: string;
  damage: number;
  reward: number;
  experience: number;
  isCriticalHit: boolean;
  itemDropped?: string;
  comboCount: number;
}

interface BattleLogProps {
  battleLog: BattleLogEntry[];
}

export default function BattleLog({ battleLog }: BattleLogProps) {
  const [selectedTab, setSelectedTab] = useState("all");
  const [filteredLogs, setFilteredLogs] = useState<BattleLogEntry[]>([]);
  const { t, locale } = useI18n();

  useEffect(() => {
    if (!battleLog || battleLog.length === 0) return;

    let logs = [...battleLog];
    
    // Filter based on selected tab
    if (selectedTab !== "all") {
      logs = logs.filter(log => log.area === selectedTab);
    }
    
    // Sort by timestamp (newest first)
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setFilteredLogs(logs);
  }, [battleLog, selectedTab]);

  if (!battleLog || battleLog.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{locale === 'th' ? 'บันทึกการต่อสู้' : 'Battle Log'}</CardTitle>
          <CardDescription>
            {locale === 'th' 
              ? 'คุณยังไม่มีประวัติการต่อสู้' 
              : 'You have no battle history yet'}
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Sword className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>{locale === 'th' ? 'ออกไปต่อสู้กับสัตว์ประหลาดเพื่อเพิ่มบันทึกการต่อสู้' : 'Go fight some monsters to add battle records'}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate areas from battle logs
  const areas = [...new Set(battleLog.map(log => log.area))];
  
  // Format time function
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{locale === 'th' ? 'บันทึกการต่อสู้' : 'Battle Log'}</CardTitle>
            <CardDescription>
              {locale === 'th' 
                ? 'ประวัติการต่อสู้ล่าสุดของคุณ' 
                : 'Your recent battle history'}
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {battleLog.length} {locale === 'th' ? 'รายการ' : 'entries'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setSelectedTab} className="mb-4">
          <TabsList className="w-full overflow-x-auto">
            <TabsTrigger value="all">
              {locale === 'th' ? 'ทั้งหมด' : 'All'}
            </TabsTrigger>
            {areas.map(area => (
              <TabsTrigger key={area} value={area}>
                {locale === 'th' ? 
                  area === 'Forest' ? 'ป่า' : 
                  area === 'Cave' ? 'ถ้ำ' : 
                  area === 'Desert' ? 'ทะเลทราย' : 
                  area === 'Volcano' ? 'ภูเขาไฟ' : area
                  : area}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <ScrollArea className="h-[400px] pr-4">
          <AnimatePresence>
            {filteredLogs.map((log, index) => (
              <motion.div
                key={`${log.timestamp}-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 
                    ${log.area === 'Forest' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                    log.area === 'Cave' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                    log.area === 'Desert' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                    log.area === 'Volcano' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 
                    'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'}`}
                  >
                    <Sword className="w-5 h-5" />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium">
                          {locale === 'th' ? 'โจมตี ' : 'Attacked '} 
                          <span className="font-semibold">{log.monsterName}</span>
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(log.timestamp)}
                        </span>
                      </div>
                      <Badge 
                        variant={log.isCriticalHit ? "destructive" : "secondary"} 
                        className="text-xs"
                      >
                        {log.isCriticalHit ? 
                          (locale === 'th' ? 'โจมตีคริติคอล!' : 'Critical Hit!') : 
                          (locale === 'th' ? 'โจมตีปกติ' : 'Normal Attack')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                      <div className="flex items-center">
                        <Sword className="w-3 h-3 mr-1 text-red-500" />
                        <span>{locale === 'th' ? 'ความเสียหาย: ' : 'Damage: '}</span>
                        <span className="font-medium ml-1">{log.damage}</span>
                      </div>
                      <div className="flex items-center">
                        <Coins className="w-3 h-3 mr-1 text-yellow-500" />
                        <span>{locale === 'th' ? 'เหรียญ: ' : 'Coins: '}</span>
                        <span className="font-medium ml-1">+{log.reward}</span>
                      </div>
                      <div className="flex items-center">
                        <Trophy className="w-3 h-3 mr-1 text-blue-500" />
                        <span>{locale === 'th' ? 'ประสบการณ์: ' : 'XP: '}</span>
                        <span className="font-medium ml-1">+{log.experience}</span>
                      </div>
                    </div>

                    {log.itemDropped && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-md text-xs">
                        <div className="flex items-center">
                          <Sparkles className="w-4 h-4 mr-1 text-purple-500" />
                          <span className="font-medium">
                            {locale === 'th' ? 'ได้รับไอเทม: ' : 'Item dropped: '}
                            <span className="text-purple-500 dark:text-purple-400">{log.itemDropped}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {log.comboCount > 1 && (
                      <div className="mt-1 text-xs flex items-center">
                        <Zap className="w-3 h-3 mr-1 text-amber-500" />
                        <span className="text-amber-500 dark:text-amber-400 font-medium">
                          {locale === 'th' ? `คอมโบ x${log.comboCount}!` : `Combo x${log.comboCount}!`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {index < filteredLogs.length - 1 && (
                  <Separator className="my-4" />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 