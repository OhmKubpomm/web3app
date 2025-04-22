"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3-client";
import Web3Status from "@/components/web3-status";
import { Button } from "@/components/ui/button";

export default function WalletStatus() {
  const router = useRouter();
  const { address, isConnected } = useWeb3();
  const [addressFromCookie, setAddressFromCookie] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // ตรวจสอบ cookie เมื่อ component mount
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(';').shift();
        return cookieValue;
      }
      return null;
    };

    const playerAddress = getCookieValue("player_address");
    if (playerAddress) {
      setAddressFromCookie(playerAddress);
      setDebugInfo(`Cookie found: ${playerAddress.slice(0, 6)}...${playerAddress.slice(-4)}`);
    } else {
      setDebugInfo("No player_address cookie found");
    }
  }, []);

  // ตรวจสอบเมื่อ address เปลี่ยนแปลง
  useEffect(() => {
    if (address) {
      setAddressFromCookie(address);
      setDebugInfo(prev => `${prev} | Web3 address: ${address.slice(0, 6)}...${address.slice(-4)}`);
    }
  }, [address]);

  // เลือกใช้ address จาก cookie ก่อน แล้วจึงใช้จาก web3 hook
  const activeAddress = addressFromCookie || address;

  // ฟังก์ชันสำหรับนำทางไปยัง dashboard
  const handleGameEntry = async () => {
    if (!activeAddress) return;
    
    // เพิ่มความมั่นใจว่ามี cookie ก่อนนำทาง
    if (!document.cookie.includes("player_address")) {
      // ถ้าไม่มี cookie แต่มี address จาก web3 ให้ตั้งค่า cookie เอง
      document.cookie = `player_address=${activeAddress}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      
      // เรียกใช้ API save-player เพื่อบันทึกข้อมูลฝั่ง server ด้วย
      try {
        await fetch("/api/save-player", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ address: activeAddress }),
        });
      } catch (error) {
        console.error("Error saving player:", error);
      }
    }
    
    // นำทางไปยัง dashboard
    router.push("/dashboard");
  };

  // ถ้ามี address ให้แสดงปุ่มเข้าสู่เกม
  if (activeAddress) {
    return (
      <div className="flex flex-col items-center">
        <p className="mb-4">
          กระเป๋าเงินที่เชื่อมต่อ: {activeAddress.slice(0, 6)}...{activeAddress.slice(-4)}
        </p>
        
        <Button
          onClick={handleGameEntry}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          เข้าสู่เกม
        </Button>
        
        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 text-xs text-gray-500">Debug: {debugInfo}</p>
        )}
      </div>
    );
  }

  // ถ้าไม่มี address ให้แสดงปุ่มเชื่อมต่อกระเป๋า
  return <Web3Status />;
} 