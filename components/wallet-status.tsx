"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3-client";
import Web3Status from "@/components/web3-status";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function WalletStatus() {
  const router = useRouter();
  const { address, isConnected } = useWeb3();
  const [addressFromCookie, setAddressFromCookie] = useState<string | null>(
    null
  );
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [isNavigating, setIsNavigating] = useState(false);

  // ตรวจสอบ cookie เมื่อ component mount
  useEffect(() => {
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        return cookieValue;
      }
      return null;
    };

    const playerAddress = getCookieValue("player_address");
    if (playerAddress) {
      setAddressFromCookie(playerAddress);
      setDebugInfo(
        `Cookie found: ${playerAddress.slice(0, 6)}...${playerAddress.slice(
          -4
        )}`
      );
    } else {
      setDebugInfo("No player_address cookie found");
    }
  }, []);

  // ตรวจสอบเมื่อ address เปลี่ยนแปลง
  useEffect(() => {
    if (address) {
      setAddressFromCookie(address);
      setDebugInfo(
        (prev) =>
          `${prev} | Web3 address: ${address.slice(0, 6)}...${address.slice(
            -4
          )}`
      );
    }
  }, [address]);

  // เลือกใช้ address จาก cookie ก่อน แล้วจึงใช้จาก web3 hook
  const activeAddress = addressFromCookie || address;

  // ฟังก์ชันสำหรับนำทางไปยัง dashboard
  const handleGameEntry = async () => {
    if (!activeAddress) return;
    if (isNavigating) return; // ป้องกันการคลิกซ้ำ

    setIsNavigating(true);

    try {
      // แสดง toast ว่ากำลังเตรียมข้อมูล
      const toastId = toast.loading("กำลังเตรียมข้อมูลเกม...", {
        description: "กรุณารอสักครู่",
      });

      // ตั้งค่า cookie ทุกครั้งเพื่อให้แน่ใจว่ามีการอัพเดตล่าสุด
      document.cookie = `player_address=${activeAddress}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;

      // เรียกใช้ API save-player เพื่อบันทึกข้อมูลฝั่ง server ด้วย
      const response = await fetch("/api/save-player", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: activeAddress }),
      });

      if (!response.ok) {
        throw new Error("ไม่สามารถบันทึกข้อมูลผู้เล่นได้");
      }

      // อัพเดต toast เป็นสำเร็จ
      toast.success("เตรียมข้อมูลเสร็จสิ้น", {
        id: toastId,
        description: "กำลังนำทางไปยังหน้าเกม...",
      });

      // หน่วงเวลาเล็กน้อยเพื่อให้ toast แสดงก่อนนำทาง
      setTimeout(() => {
        // นำทางไปยัง dashboard ด้วย window.location.href เพื่อให้แน่ใจว่ามีการโหลดหน้าใหม่
        window.location.href = "/dashboard";
      }, 500);
    } catch (error) {
      console.error("Error preparing game entry:", error);

      // แสดงข้อผิดพลาด แต่ยังพยายามนำทางต่อ
      toast.error("พบข้อผิดพลาดในการเตรียมข้อมูล", {
        description: "กำลังพยายามเข้าสู่เกม...",
      });

      // ตั้งค่า cookie อีกครั้งเพื่อให้แน่ใจ
      document.cookie = `player_address=${activeAddress}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;

      // นำทางไปยัง dashboard แม้จะมีข้อผิดพลาด ด้วย window.location.href
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } finally {
      setIsNavigating(false);
    }
  };

  // ถ้ามี address ให้แสดงปุ่มเข้าสู่เกม
  if (activeAddress) {
    return (
      <div className="flex flex-col items-center">
        <p className="mb-4">
          กระเป๋าเงินที่เชื่อมต่อ: {activeAddress.slice(0, 6)}...
          {activeAddress.slice(-4)}
        </p>

        <Button
          onClick={handleGameEntry}
          disabled={isNavigating}
          className={`px-6 py-3 ${
            isNavigating ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } transition-colors`}
        >
          {isNavigating ? "กำลังเข้าสู่เกม..." : "เข้าสู่เกม"}
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
