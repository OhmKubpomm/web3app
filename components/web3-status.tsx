"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import { getNetworkName } from "@/lib/web3-client";
import { Wallet, Network, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export default function Web3Status() {
  const { address, chainId, isConnected, connect, disconnect, switchNetwork } =
    useWeb3();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // ใช้ address จาก wagmi ถ้า address จาก useWeb3 ไม่มี
  const actualAddress = address || wagmiAddress;
  const actualIsConnected = isConnected || wagmiIsConnected;

  // ตรวจสอบว่าเป็นเครือข่าย Monad หรือไม่
  const isMonad = chainId === 10143;

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

  // ฟังก์ชันสำหรับเปลี่ยนเครือข่ายไป Monad Testnet
  const handleSwitchToMonad = async () => {
    setIsLoading(true);
    try {
      await switchNetwork(10143);
    } catch (error) {
      console.error("Error switching to Monad:", error);
      toast.error("เปลี่ยนเครือข่ายไม่สำเร็จ", {
        description: "กรุณาลองใหม่อีกครั้ง หรือเพิ่มเครือข่าย Monad ด้วยตนเอง",
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
          <span className="hidden md:inline flex items-center gap-1">
            {isMonad ? (
              <>
                <Badge
                  variant="outline"
                  className="h-4 bg-green-500/20 border-green-500 text-green-500 mr-1 px-1 py-0 text-[10px]"
                >
                  <CheckCircle2 className="h-2 w-2 mr-0.5" />
                  MONAD
                </Badge>
              </>
            ) : (
              <>
                <Badge
                  variant="outline"
                  className="h-4 bg-yellow-500/20 border-yellow-500 text-yellow-500 mr-1 px-1 py-0 text-[10px]"
                >
                  <AlertTriangle className="h-2 w-2 mr-0.5" />
                  {getNetworkName(chainId)}
                </Badge>
              </>
            )}
          </span>
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
          <span
            className={`font-medium ${
              isMonad ? "text-green-500" : "text-yellow-500"
            }`}
          >
            {getNetworkName(chainId)}
          </span>
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
        <DropdownMenuItem
          onClick={handleSwitchToMonad}
          className={isMonad ? "bg-green-900/20 text-green-300" : ""}
        >
          Monad Testnet {isMonad && "✓"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchNetwork(1)}>
          Ethereum Mainnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => switchNetwork(11155111)}>
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
