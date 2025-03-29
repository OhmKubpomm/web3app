"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import { getNetworkName } from "@/lib/web3-client";
import { Wallet, Network } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function Web3Status() {
  const { address, chainId, isConnected, connect, disconnect, switchNetwork } =
    useWeb3();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // ใช้ address จาก wagmi ถ้า address จาก useWeb3 ไม่มี
  const actualAddress = address || wagmiAddress;
  const actualIsConnected = isConnected || wagmiIsConnected;

  // ฟังก์ชันสำหรับเชื่อมต่อกระเป๋าเงิน
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connect();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("เชื่อมต่อกระเป๋าเงินไม่สำเร็จ", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ฟังก์ชันสำหรับตัดการเชื่อมต่อ
  const handleDisconnect = () => {
    try {
      disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("ตัดการเชื่อมต่อกระเป๋าเงินไม่สำเร็จ", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนเครือข่าย
  const handleSwitchNetwork = async (newChainId: number) => {
    setIsLoading(true);
    try {
      await switchNetwork(newChainId);
    } catch (error) {
      console.error("Error switching network:", error);
      toast.error("เปลี่ยนเครือข่ายไม่สำเร็จ", {
        description: "กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ถ้ายังไม่ได้เชื่อมต่อ
  if (!actualIsConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="bg-black/20 border-purple-500/30 hover:bg-black/40 hover:border-purple-500/50"
        onClick={handleConnect}
        disabled={isLoading}
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isLoading ? "กำลังเชื่อมต่อ..." : "เชื่อมต่อกระเป๋าเงิน"}
      </Button>
    );
  }

  // ถ้าเชื่อมต่อแล้ว
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-black/20 border-purple-500/30 hover:bg-black/40 hover:border-purple-500/50"
        >
          <Network className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">{getNetworkName(chainId)}</span>
          <span className="md:ml-2">
            {actualAddress
              ? `${actualAddress.slice(0, 6)}...${actualAddress.slice(-4)}`
              : ""}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>กระเป๋าเงินของคุณ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex justify-between">
          <span>เครือข่าย</span>
          <span className="font-medium">{getNetworkName(chainId)}</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex justify-between">
          <span>ที่อยู่</span>
          <span className="font-mono text-xs">
            {actualAddress
              ? `${actualAddress.slice(0, 6)}...${actualAddress.slice(-4)}`
              : ""}
          </span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>เปลี่ยนเครือข่าย</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => handleSwitchNetwork(1)}>
          Ethereum Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchNetwork(137)}>
          Polygon
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchNetwork(80001)}>
          Mumbai Testnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchNetwork(11155111)}>
          Sepolia Testnet
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDisconnect} className="text-red-500">
          ตัดการเชื่อมต่อ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
