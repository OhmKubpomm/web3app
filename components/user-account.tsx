"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Wallet,
  Coins,
  Settings,
  HelpCircle,
  Bell,
  Shield,
} from "lucide-react";
import { useWeb3 } from "@/lib/web3-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatAddress } from "@/lib/utils";

interface UserAccountProps {
  gameData: any;
}

export function UserAccount({ gameData }: UserAccountProps) {
  const { address, disconnect } = useWeb3();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // ฟังก์ชันออกจากระบบ
  const handleLogout = () => {
    disconnect();
    document.cookie =
      "player_address=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    toast.success("ออกจากระบบสำเร็จ", {
      description: "คุณได้ออกจากระบบแล้ว",
    });
    router.push("/");
  };

  // สร้างตัวอักษรแรกของที่อยู่กระเป๋า
  const getInitials = () => {
    if (!address) return "U";
    return address.substring(2, 4).toUpperCase();
  };

  // คำนวณเลเวลของผู้เล่น
  const getPlayerLevel = () => {
    if (!gameData?.characters) return 1;
    return Math.max(...gameData.characters.map((c: any) => c.level || 1));
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border border-purple-500/30 bg-black/40 p-0"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`/placeholder.svg?height=36&width=36`}
              alt="Avatar"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{
              repeat: isOpen ? 0 : Number.POSITIVE_INFINITY,
              duration: 2,
            }}
            className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-green-500 border border-black"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 bg-black/90 backdrop-blur-lg border-purple-500/30"
      >
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-10 w-10 border-2 border-purple-500">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40`}
              alt="Avatar"
            />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium truncate">
              {formatAddress(address || "")}
            </p>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>ระดับ {getPlayerLevel()}</span>
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-800" />

        <div className="p-2">
          <div className="grid grid-cols-2 gap-1 mb-2">
            <div className="bg-black/60 p-2 rounded-md">
              <p className="text-xs text-gray-400">เหรียญ</p>
              <p className="font-medium flex items-center gap-1">
                <Coins className="h-3.5 w-3.5 text-yellow-400" />
                <span>{gameData?.coins?.toLocaleString() || 0}</span>
              </p>
            </div>
            <div className="bg-black/60 p-2 rounded-md">
              <p className="text-xs text-gray-400">พลังโจมตี</p>
              <p className="font-medium flex items-center gap-1">
                <Sword className="h-3.5 w-3.5 text-red-400" />
                <span>{gameData?.damage || 1}</span>
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-800" />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-purple-900/30">
          <User className="h-4 w-4 text-purple-400" />
          <span>โปรไฟล์</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-purple-900/30">
          <Wallet className="h-4 w-4 text-blue-400" />
          <span>กระเป๋าเงิน</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-purple-900/30">
          <Bell className="h-4 w-4 text-yellow-400" />
          <span>การแจ้งเตือน</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-purple-900/30">
          <Settings className="h-4 w-4 text-gray-400" />
          <span>ตั้งค่า</span>
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer focus:bg-purple-900/30">
          <HelpCircle className="h-4 w-4 text-green-400" />
          <span>ช่วยเหลือ</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-800" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-900/30"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>ออกจากระบบ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Import Sword component
import { Sword } from "lucide-react";
