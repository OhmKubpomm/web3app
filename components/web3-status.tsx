"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount, useChainId } from "wagmi";
import { getNetworkName } from "@/lib/web3-client";
import { Wallet, ChevronDown, Check, ExternalLink } from "lucide-react";
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

export default function Web3Status() {
  const { address, isConnected, disconnect } = useWeb3();
  const { isConnected: wagmiIsConnected } = useAccount();
  const chainId = useChainId();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
              variant="outline"
              size="sm"
              onClick={openConnectModal}
              className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border-purple-500/30"
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
          className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 hover:from-purple-600/30 hover:to-blue-600/30 border-purple-500/30"
        >
          <Wallet className="mr-2 h-4 w-4" />
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
        <DropdownMenuLabel>กระเป๋าเงิน</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between cursor-default">
          <span className="text-gray-400">เครือข่าย</span>
          <span>{getNetworkName(chainId)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={copyAddressToClipboard}
          className="cursor-pointer"
        >
          <Check className="mr-2 h-4 w-4" />
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
          ตัดการเชื่อมต่อ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
