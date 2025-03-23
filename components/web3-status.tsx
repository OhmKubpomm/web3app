"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount, useChainId } from "wagmi";
import { getNetworkName } from "@/lib/web3-client";
import { Wallet, ChevronDown, ExternalLink, LogOut, Copy } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Web3Status() {
  const { address, isConnected, disconnect } = useWeb3();
  const { isConnected: wagmiIsConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // ฟังก์ชันตัดการเชื่อมต่อและกลับไปหน้าแรก
  const handleDisconnect = () => {
    disconnect();
    router.push("/");
    toast.success("ตัดการเชื่อมต่อแล้ว", {
      position: "top-right",
    });
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

  // ถ้าไม่ได้เชื่อมต่อ ให้แสดงปุ่มเชื่อมต่อ
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="animate-pulse">
        <Wallet className="mr-2 h-4 w-4" />
        กำลังโหลด...
      </Button>
    );
  }

  if (!isConnected && !wagmiIsConnected) {
    return (
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const ready = mounted;

          if (!ready) {
            return (
              <Button variant="outline" size="sm" className="animate-pulse">
                <Wallet className="mr-2 h-4 w-4" />
                กำลังโหลด...
              </Button>
            );
          }

          return (
            <Button
              variant="default"
              size="sm"
              onClick={openConnectModal}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-none"
            >
              <Wallet className="mr-2 h-4 w-4" />
              เชื่อมต่อกระเป๋า
            </Button>
          );
        }}
      </ConnectButton.Custom>
    );
  }

  // ถ้าเชื่อมต่อแล้ว ให้แสดงข้อมูลกระเป๋า
  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border-purple-500/30 flex items-center gap-2"
        >
          <Avatar className="h-5 w-5 mr-1">
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white text-xs">
              {address?.slice(2, 4).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline mr-1">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-black/90 backdrop-blur-lg border-purple-500/30"
      >
        <DropdownMenuLabel className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>เชื่อมต่อแล้ว</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between cursor-default">
          <span className="text-gray-400">เครือข่าย</span>
          <span>{getNetworkName(chainId)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={copyAddressToClipboard}
          className="cursor-pointer"
        >
          <Copy className="mr-2 h-4 w-4" />
          <span>คัดลอกที่อยู่</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={openBlockExplorer}
          className="cursor-pointer"
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          <span>ดูใน Explorer</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnect}
          className="text-red-500 cursor-pointer focus:text-red-500"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>ตัดการเชื่อมต่อ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
