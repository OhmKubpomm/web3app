"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Star,
  Sword,
  Shield,
  Sparkles,
  Trophy,
  Clock,
  Wallet,
  Layers,
  ExternalLink,
  Copy,
} from "lucide-react";
import { formatAddress } from "@/lib/utils";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount, useBalance, useChainId } from "wagmi";
import { toast } from "sonner";
import { getNetworkName } from "@/lib/web3-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PlayerProfileProps {
  gameData: any;
}

export default function PlayerProfile({ gameData }: PlayerProfileProps) {
  const [showStats, setShowStats] = useState(false);
  const [showBlockchainInfo, setShowBlockchainInfo] = useState(false);
  const { address, isConnected } = useWeb3();
  const { address: wagmiAddress } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({
    address: wagmiAddress as `0x${string}`,
  });
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // ถ้าไม่ได้เชื่อมต่อกระเป๋า ให้แสดงข้อความให้เชื่อมต่อ
  if (!mounted || !isConnected || !address) {
    return (
      <Card className="border-purple-500/50 bg-black/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            <span>โปรไฟล์นักผจญภัย</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center">
          <Wallet className="h-12 w-12 mx-auto mb-4 text-purple-400 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">กรุณาเชื่อมต่อกระเป๋า</h3>
          <p className="text-sm text-gray-400 mb-4">
            เชื่อมต่อกระเป๋าเพื่อดูข้อมูลโปรไฟล์ของคุณ
          </p>
        </CardContent>
      </Card>
    );
  }

  // คำนวณเลเวลของผู้เล่นจากค่าเฉลี่ยของตัวละคร
  const calculatePlayerLevel = () => {
    if (!gameData || !gameData.characters || gameData.characters.length === 0)
      return 1;

    const totalLevel = gameData.characters.reduce(
      (sum: number, char: any) => sum + char.level,
      0
    );
    return Math.floor(totalLevel / gameData.characters.length);
  };

  // คำนวณ XP ปัจจุบันและ XP ที่ต้องการสำหรับเลเวลถัดไป
  const calculateXP = () => {
    const level = calculatePlayerLevel();
    const currentXP = Math.floor(Math.random() * 100); // สมมติว่าเป็นค่าสุ่ม (ควรมาจากฐานข้อมูลจริง)
    const requiredXP = level * 100;

    return {
      currentXP,
      requiredXP,
      percentage: (currentXP / requiredXP) * 100,
    };
  };

  // คำนวณตำแหน่งของผู้เล่น
  const calculateRank = () => {
    const level = calculatePlayerLevel();

    if (level < 5) return "นักผจญภัยมือใหม่";
    if (level < 10) return "นักผจญภัยมืออาชีพ";
    if (level < 15) return "นักล่าอสูร";
    if (level < 20) return "ราชันย์นักรบ";
    return "ตำนานนักผจญภัย";
  };

  // ฟังก์ชันคัดลอก address ไปยัง clipboard
  const copyAddressToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("คัดลอกแล้ว", {
        description: "คัดลอกที่อยู่กระเป๋าไปยังคลิปบอร์ดแล้ว",
        position: "top-right",
      });
    }
  };

  // ฟังก์ชันเปิด block explorer
  const openBlockExplorer = () => {
    if (!address || !chainId) return;

    let explorerUrl = "";
    if (chainId === 1) {
      explorerUrl = `https://etherscan.io/address/${address}`;
    } else if (chainId === 137) {
      explorerUrl = `https://polygonscan.com/address/${address}`;
    } else if (chainId === 80001) {
      explorerUrl = `https://mumbai.polygonscan.com/address/${address}`;
    } else if (chainId === 11155111) {
      explorerUrl = `https://sepolia.etherscan.io/address/${address}`;
    } else {
      explorerUrl = `https://etherscan.io/address/${address}`;
    }

    window.open(explorerUrl, "_blank");
  };

  const playerLevel = calculatePlayerLevel();
  const xpInfo = calculateXP();
  const rank = calculateRank();

  return (
    <Card className="border-purple-500/50 bg-gradient-to-br from-black/60 to-purple-900/20 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-purple-400" />
          <span>โปรไฟล์นักผจญภัย</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <AnimatePresence mode="wait">
          {showBlockchainInfo ? (
            <motion.div
              key="blockchain"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">ข้อมูล Blockchain</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBlockchainInfo(false)}
                >
                  กลับ
                </Button>
              </div>

              <div className="space-y-3">
                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      ที่อยู่กระเป๋า
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-mono">
                      {formatAddress(address)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={copyAddressToClipboard}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Layers className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">เครือข่าย</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <p className="text-sm">{getNetworkName(chainId)}</p>
                  </div>
                </div>

                {balanceData && (
                  <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-gray-300">ยอดคงเหลือ</span>
                    </div>
                    <p className="text-sm font-medium">
                      {Number.parseFloat(balanceData.formatted).toFixed(4)}{" "}
                      {balanceData.symbol}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-blue-500/30 hover:bg-blue-500/20"
                  onClick={openBlockExplorer}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  ดูใน Block Explorer
                </Button>
              </div>
            </motion.div>
          ) : showStats ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">สถิติการเล่น</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStats(false)}
                >
                  กลับ
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">
                      มอนสเตอร์ที่สังหาร
                    </span>
                  </div>
                  <p className="text-lg font-bold">150</p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">
                      ไอเทมที่เก็บได้
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {gameData?.inventory?.length || 0}
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">
                      พลังโจมตีสูงสุด
                    </span>
                  </div>
                  <p className="text-lg font-bold">
                    {(
                      gameData?.damage *
                      (gameData?.upgrades?.damageMultiplier || 1)
                    ).toFixed(1)}
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">เวลาเล่น</span>
                  </div>
                  <p className="text-lg font-bold">5 ชั่วโมง</p>
                </div>
              </div>

              <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-gray-300">ตำแหน่ง</span>
                </div>
                <p className="text-lg font-bold text-amber-300">{rank}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-16 h-16 border-2 border-purple-500">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-xl">
                      {address?.slice(2, 4).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-yellow-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border border-yellow-300">
                    {playerLevel}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold">{formatAddress(address)}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Badge className="bg-gradient-to-r from-amber-600 to-yellow-500 text-white border-none">
                      <Trophy className="h-3 w-3 mr-1" />
                      {rank}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-400" />
                    เลเวล {playerLevel}
                  </span>
                  <span>
                    {xpInfo.currentXP}/{xpInfo.requiredXP} XP
                  </span>
                </div>
                <Progress
                  value={xpInfo.percentage}
                  className="h-2 bg-black/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sword className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-gray-300">พลังโจมตี</span>
                  </div>
                  <p className="text-lg font-bold">
                    {(
                      gameData?.damage *
                      (gameData?.upgrades?.damageMultiplier || 1)
                    ).toFixed(1)}
                  </p>
                </div>

                <div className="bg-black/30 p-3 rounded-lg border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm text-gray-300">พลังอัตโนมัติ</span>
                  </div>
                  <p className="text-lg font-bold">
                    {gameData?.autoDamage || 0}/วิ
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="w-full border-purple-500/50 hover:bg-purple-500/20"
                  onClick={() => setShowStats(true)}
                >
                  ดูสถิติเพิ่มเติม
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-blue-500/50 hover:bg-blue-500/20"
                  onClick={() => setShowBlockchainInfo(true)}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  ข้อมูล Blockchain
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
