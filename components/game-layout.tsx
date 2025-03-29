"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { useI18n } from "@/lib/i18n";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import LanguageSwitcher from "@/components/language-switcher";
import NetworkSwitcher from "@/components/network-switcher";
import { formatAddress } from "@/lib/utils";
import {
  Sword,
  Users,
  Map,
  Package,
  ScrollText,
  Trophy,
  Settings,
  LogOut,
  Wallet,
  Coins,
  Home,
} from "lucide-react";
import { toast } from "sonner";

interface GameLayoutProps {
  children: React.ReactNode;
  gameData: any;
  playerAddress: string;
}

export default function GameLayout({
  children,
  gameData,
  playerAddress,
}: GameLayoutProps) {
  const { address, isConnected } = useAccount();
  const { t } = useI18n();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Fix hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect to home if not connected
  useEffect(() => {
    if (mounted && !isConnected) {
      router.push("/");
    }
  }, [mounted, isConnected, router]);

  const handleLogout = () => {
    // ใช้ router.push แทน window.location.href เพื่อให้เป็น client-side navigation
    router.push("/");
    toast.success(t("common.success"), {
      description: t("common.logout"),
      position: "top-right",
    });
  };

  if (!mounted) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                <Sword className="h-4 w-4 text-primary" />
              </div>
              <div className="font-semibold text-lg bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                {t("game.title")}
              </div>
            </div>
            <SidebarTrigger />
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={t("game.tabs.battle")}
                  isActive={true}
                >
                  <Sword className="h-4 w-4 text-red-400" />
                  <span>{t("game.tabs.battle")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.tabs.characters")}>
                  <Users className="h-4 w-4 text-blue-400" />
                  <span>{t("game.tabs.characters")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.tabs.map")}>
                  <Map className="h-4 w-4 text-green-400" />
                  <span>{t("game.tabs.map")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.tabs.inventory")}>
                  <Package className="h-4 w-4 text-purple-400" />
                  <span>{t("game.tabs.inventory")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.quests.title")}>
                  <ScrollText className="h-4 w-4 text-yellow-400" />
                  <span>{t("game.quests.title")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.stats.title")}>
                  <Trophy className="h-4 w-4 text-amber-400" />
                  <span>{t("game.stats.title")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarSeparator />

            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Home"
                  onClick={() => router.push("/")}
                >
                  <Home className="h-4 w-4 text-gray-400" />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton tooltip={t("game.upgrades.title")}>
                  <Settings className="h-4 w-4 text-gray-400" />
                  <span>{t("game.upgrades.title")}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4">
            {address && (
              <div className="mb-2 flex items-center gap-2 rounded-md bg-black/20 p-2">
                <Wallet className="h-4 w-4 text-purple-400" />
                <span className="text-xs text-gray-300">
                  {formatAddress(address)}
                </span>
              </div>
            )}

            {gameData && (
              <div className="mb-4 flex items-center gap-2 rounded-md bg-black/20 p-2">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-yellow-300">
                  {gameData.coins.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <NetworkSwitcher />
              <Button
                variant="destructive"
                size="sm"
                className="w-full mt-2"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("common.back")}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 overflow-auto p-6 pt-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </SidebarProvider>
  );
}
