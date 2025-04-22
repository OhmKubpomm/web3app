"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWeb3 } from "@/lib/web3-client";
import { useAccount } from "wagmi";
import { getNetworkName } from "@/lib/web3-client";
import { Wallet, Network, AlertTriangle, CheckCircle2, Check, AlertCircle, RefreshCw, Cpu, Copy, ExternalLink, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { isSimulationMode, setSimulationMode } from "@/lib/simulation-mode";

export default function Web3Status() {
  const { address, chainId, isConnected, connect, disconnect, switchNetwork } =
    useWeb3();
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState(false);

  useEffect(() => {
    // ตรวจสอบสถานะโหมดจำลองเมื่อคอมโพเนนท์โหลด
    setSimulation(isSimulationMode());
  }, []);

  // ใช้ address จาก wagmi ถ้า address จาก useWeb3 ไม่มี
  const actualAddress = address || wagmiAddress;
  const actualIsConnected = isConnected || wagmiIsConnected;

  // ตรวจสอบว่าเป็นเครือข่าย Monad หรือไม่
  const isMonad = chainId === 10143;

  const toggleSimulationMode = () => {
    const newMode = !simulation;
    setSimulationMode(newMode);
    setSimulation(newMode);
    
    toast.success(
      newMode 
        ? "เปิดใช้งานโหมดจำลองแล้ว" 
        : "ปิดใช้งานโหมดจำลอง กลับสู่โหมดบล็อกเชนจริง", 
      {
        description: newMode 
          ? "ขณะนี้คุณสามารถใช้งานแอปได้โดยไม่ต้องเชื่อมต่อกับบล็อกเชน" 
          : "คุณจำเป็นต้องเชื่อมต่อกระเป๋าเงินเพื่อดำเนินการต่อ"
      }
    );
  };

  // ฟังก์ชันสำหรับเชื่อมต่อกระเป๋าเงิน
  const handleConnect = async () => {
    // ตรวจสอบว่า RainbowKit พร้อมใช้งานหรือไม่
    if (openConnectModal) {
      openConnectModal();
    } else {
      // ใช้วิธีการเชื่อมต่อทางเลือก
      try {
        await connect();
      } catch (error) {
        console.error("Error connecting:", error);
        toast.error("ไม่สามารถเชื่อมต่อกระเป๋าเงินได้", {
          description: "กรุณาลองอีกครั้งหรือใช้โหมดจำลองแทน",
        });
      }
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
      <div className="flex items-center gap-2">
        <Button onClick={handleConnect} className="bg-blue-600 hover:bg-blue-700">
          เชื่อมต่อกระเป๋าเงิน
        </Button>
        
        <Button
          variant={simulation ? "default" : "outline"}
          size="icon"
          className={simulation ? "bg-purple-600 hover:bg-purple-700" : ""}
          onClick={toggleSimulationMode}
          title={simulation ? "ปิดโหมดจำลอง" : "เปิดโหมดจำลอง"}
        >
          <Cpu className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // ถ้าเชื่อมต่อแล้ว
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${
            actualIsConnected
              ? "bg-green-950/20 border-green-600/30 hover:bg-green-950/30"
              : "bg-black/20 border-purple-500/30 hover:bg-black/40 hover:border-purple-500/50"
          }`}
        >
          {actualIsConnected ? (
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              <span>
                {actualAddress?.slice(0, 4)}...{actualAddress?.slice(-4)}
              </span>
              {chainId && (
                <Badge
                  variant="outline"
                  className="ml-2 h-5 border-blue-500/50 text-blue-400"
                >
                  {isMonad ? "Monad" : getNetworkName(chainId)}
                </Badge>
              )}
              {simulation && (
                <Badge
                  variant="outline"
                  className="ml-2 h-5 border-purple-500/50 text-purple-400"
                >
                  Simulation
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              <span>เชื่อมต่อกระเป๋าเงิน</span>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[240px]">
        <DropdownMenuLabel>บัญชีของฉัน</DropdownMenuLabel>
        {actualIsConnected ? (
          <>
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                navigator.clipboard.writeText(actualAddress || "");
                toast.success("คัดลอกแล้ว", {
                  description: "คัดลอกที่อยู่กระเป๋าเงินแล้ว",
                });
              }}
            >
              <Copy className="h-4 w-4" />
              คัดลอกที่อยู่
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                window.open(
                  `https://testnet.monadexplorer.com/address/${actualAddress}`,
                  "_blank"
                );
              }}
            >
              <ExternalLink className="h-4 w-4" />
              ดูบนบล็อกเอ็กซ์พลอเรอร์
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex gap-2"
              onClick={toggleSimulationMode}
            >
              <Cpu className="h-4 w-4" />
              {simulation ? "ปิดโหมดจำลอง" : "เปิดโหมดจำลอง"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex gap-2">
                <Network className="h-4 w-4" />
                สลับเครือข่าย
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => switchNetwork(1)}>
                  Ethereum Mainnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchNetwork(11155111)}>
                  Sepolia Testnet
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchNetwork(10143)}>
                  Monad Testnet
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              className="flex gap-2"
              onClick={() => {
                disconnect();
                toast.success("ออกจากระบบแล้ว", {
                  description:
                    "ออกจากระบบสำเร็จแล้ว คุณสามารถเชื่อมต่อใหม่ได้ทุกเมื่อ",
                });
              }}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={handleConnect} className="flex gap-2">
              <Wallet className="h-4 w-4" />
              เชื่อมต่อกระเป๋าเงิน
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex gap-2"
              onClick={toggleSimulationMode}
            >
              <Cpu className="h-4 w-4" />
              {simulation ? "ปิดโหมดจำลอง" : "เปิดโหมดจำลอง"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open("https://metamask.io/", "_blank")}
              className="flex gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              ติดตั้ง MetaMask
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
