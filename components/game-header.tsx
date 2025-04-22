"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  X,
  Home,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react";
import PlayerProfile from "@/components/player-profile";
import Web3Status from "@/components/web3-status";
import LanguageSwitcher from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useWeb3 } from "@/lib/web3-client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

interface GameHeaderProps {
  gameData: any;
}

export default function GameHeader({ gameData }: GameHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, disconnect } = useWeb3();
  const router = useRouter();
  const { locale } = useI18n();
  const [mounted, setMounted] = useState(false);

  // ตรวจสอบว่าอยู่ใน client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // ฟังก์ชันตัดการเชื่อมต่อและกลับไปหน้าแรก
  const handleLogout = () => {
    disconnect();
    router.push("/");
  };

  if (!mounted) {
    return null; // ไม่แสดงอะไรระหว่างการโหลด
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-md border-b border-purple-500/20">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-9 h-9 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">W3</span>
            <motion.div
              className="absolute inset-0 rounded-full border border-purple-400"
              animate={{ scale: [1, 1.1, 1], opacity: [0.7, 0.2, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <span className="font-bold text-lg hidden md:inline">
            {locale === "th" ? "ผจญภัยบล็อกเชน" : "Web3 Adventure"}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Web3Status />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Mobile Menu Button */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] bg-black/90 backdrop-blur-lg border-purple-500/30 p-0"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
                <h2 className="font-bold text-lg">
                  {locale === "th" ? "ผจญภัยบล็อกเชน" : "Web3 Adventure"}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Mobile Menu Content */}
              <div className="flex-1 overflow-auto py-4 px-2 space-y-6">
                {/* Player Profile (เฉพาะเมื่อเชื่อมต่อแล้ว) */}
                {isConnected && (
                  <div className="px-2">
                    <PlayerProfile gameData={gameData} />
                  </div>
                )}

                {/* Wallet Connection */}
                <div className="px-4">
                  <Web3Status />
                </div>

                {/* Navigation Links */}
                <div className="space-y-1 px-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/dashboard">
                      <Home className="mr-2 h-5 w-5" />
                      {locale === "th" ? "หน้าหลัก" : "Home"}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/leaderboard">
                      <Trophy className="mr-2 h-5 w-5" />
                      {locale === "th" ? "จัดอันดับ" : "Leaderboard"}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/settings">
                      <Settings className="mr-2 h-5 w-5" />
                      {locale === "th" ? "ตั้งค่า" : "Settings"}
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link href="/help">
                      <HelpCircle className="mr-2 h-5 w-5" />
                      {locale === "th" ? "ช่วยเหลือ" : "Help"}
                    </Link>
                  </Button>
                </div>

                {/* Settings */}
                <div className="px-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {locale === "th" ? "ธีม" : "Theme"}
                    </span>
                    <ThemeToggle />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      {locale === "th" ? "ภาษา" : "Language"}
                    </span>
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>

              {/* Mobile Menu Footer */}
              <div className="p-4 border-t border-purple-500/20">
                {isConnected && (
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-5 w-5" />
                    {locale === "th" ? "ออกจากระบบ" : "Logout"}
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <AnimatePresence>
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-16 left-0 bottom-0 w-[300px] bg-black/40 backdrop-blur-md border-r border-purple-500/20 p-4 hidden md:block"
          >
            <PlayerProfile gameData={gameData} />
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
