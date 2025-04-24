"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useWeb3 } from "@/lib/web3-client";
import GameDashboard from "@/components/game-dashboard";
import { toast } from "sonner";

// กำหนด interface สำหรับข้อมูลเกม
export interface GameData {
  playerAddress?: string;
  level?: number;
  experience?: number;
  gold?: number;
  coins?: number;
  damage?: number;
  autoDamage?: number;
  currentArea?: string;
  items?: Array<{
    id: string;
    name: string;
    type: string;
    rarity: string;
    [key: string]: unknown;
  }>;
  lastUpdated?: string;
  [key: string]: unknown; // รองรับฟิลด์เพิ่มเติมที่อาจมีในอนาคต
}

export default function DashboardClient({
  initialGameData = null,
}: {
  initialGameData: GameData | null;
}) {
  const router = useRouter();
  const { address, registerPlayer } = useWeb3();
  const [playerAddress, setPlayerAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [gameData, setGameData] = useState<GameData | null>(initialGameData);
  const [error, setError] = useState<string | null>(null);
  const [isBlockchainRegistered, setIsBlockchainRegistered] = useState<
    boolean | null
  >(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isCheckingRegistration, setIsCheckingRegistration] = useState(false);
  const hasCheckedRef = useRef(false);

  // ตรวจสอบการลงทะเบียนบน blockchain
  const checkBlockchainRegistration = useCallback(
    async (walletAddress: string) => {
      // ป้องกันการเรียกซ้ำ
      if (isCheckingRegistration || hasCheckedRef.current) return true;

      try {
        setIsCheckingRegistration(true);
        const response = await fetch(
          `/api/web3/register-check?address=${walletAddress}`
        );
        if (response.ok) {
          const data = await response.json();
          console.log("Blockchain registration status:", data);
          hasCheckedRef.current = true;
          return data.isRegistered;
        }
        hasCheckedRef.current = true;
        return true; // ถ้ามีข้อผิดพลาด ให้สมมติว่าลงทะเบียนแล้ว
      } catch (error) {
        console.error("Error checking blockchain registration:", error);
        hasCheckedRef.current = true;
        return true; // ถ้ามีข้อผิดพลาด ให้สมมติว่าลงทะเบียนแล้ว
      } finally {
        setIsCheckingRegistration(false);
      }
    },
    [isCheckingRegistration]
  );

  // ฟังก์ชันลงทะเบียนผู้เล่นบน blockchain
  const handleRegisterOnBlockchain = async () => {
    if (!address || isRegistering) return;

    setIsRegistering(true);
    try {
      toast.info("กำลังลงทะเบียนบนบล็อกเชน...", {
        description: "กรุณารอสักครู่และอนุมัติการทำธุรกรรมในกระเป๋าเงิน",
      });

      const result = await registerPlayer();

      if (result && result.hash) {
        toast.success("ลงทะเบียนสำเร็จ", {
          description: "ตอนนี้คุณสามารถเล่นเกมบนบล็อกเชนได้แล้ว!",
        });
        setIsBlockchainRegistered(true);
      } else {
        throw new Error("ไม่สามารถลงทะเบียนได้");
      }
    } catch (error) {
      console.error("Error registering on blockchain:", error);
      toast.error("ลงทะเบียนล้มเหลว", {
        description: "ไม่สามารถลงทะเบียนบนบล็อกเชนได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  useEffect(() => {
    // ตรวจสอบว่ามี player address ใน cookie หรือไม่
    const getCookieValue = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        const cookieValue = parts.pop()?.split(";").shift();
        return cookieValue;
      }
      return null;
    };

    const addressFromCookie = getCookieValue("player_address");
    const walletAddress = address || addressFromCookie;

    if (!walletAddress) {
      // ถ้าไม่มี address ใดๆ ให้กลับไปหน้าหลัก
      console.log("No wallet address found, redirecting to home page");
      router.push("/");
      return;
    }

    setPlayerAddress(walletAddress);

    // ตรวจสอบว่า cookie ตรงกับ address จาก wallet หรือไม่
    if (address && addressFromCookie !== address) {
      console.log(
        "Cookie address doesn't match wallet address, updating cookie"
      );
      // อัพเดต cookie ให้ตรงกับ address จาก wallet
      document.cookie = `player_address=${address}; path=/; max-age=${
        60 * 60 * 24 * 30
      }; SameSite=Lax`;
    }

    // ตรวจสอบการลงทะเบียนบน blockchain เพียงครั้งเดียวเท่านั้น
    const checkRegistration = async () => {
      if (walletAddress && !hasCheckedRef.current) {
        const isRegistered = await checkBlockchainRegistration(walletAddress);
        setIsBlockchainRegistered(isRegistered);
      }
    };

    checkRegistration();

    // โหลดข้อมูลเกมจากเซิร์ฟเวอร์
    const loadGameData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/game-data?address=${walletAddress}`);
        if (!response.ok) {
          throw new Error("Failed to load game data");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setGameData(data.data);
        } else {
          throw new Error(data.error || "Failed to load game data");
        }
      } catch (error) {
        console.error("Error loading game data:", error);
        setError("ไม่สามารถโหลดข้อมูลเกมได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoading(false);
      }
    };

    // ถ้าไม่มีข้อมูลเกมเริ่มต้น ให้โหลดจากเซิร์ฟเวอร์
    if (!initialGameData) {
      loadGameData();
    } else {
      setIsLoading(false);
    }
  }, [
    address,
    router,
    initialGameData,
    registerPlayer,
    checkBlockchainRegistration,
  ]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h2 className="text-2xl font-bold text-red-500 mb-4">เกิดข้อผิดพลาด</h2>
        <p className="text-lg mb-6">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  // ถ้าผู้เล่นยังไม่ได้ลงทะเบียนบน blockchain และมีการตรวจสอบแล้ว (ไม่ใช่ null)
  if (isBlockchainRegistered === false) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">ลงทะเบียนในเกม</h2>
        <p className="text-lg mb-6">
          คุณจำเป็นต้องลงทะเบียนบนบล็อกเชนก่อนเริ่มเล่นเกม
        </p>
        <button
          onClick={handleRegisterOnBlockchain}
          disabled={isRegistering}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            isRegistering
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isRegistering ? "กำลังลงทะเบียน..." : "ลงทะเบียนเล่นเกม"}
        </button>
      </div>
    );
  }

  if (!gameData || !playerAddress) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">ไม่พบข้อมูลเกม</h2>
        <p className="text-lg mb-6">
          กรุณาเชื่อมต่อกระเป๋าเงินและลองใหม่อีกครั้ง
        </p>
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          กลับไปหน้าหลัก
        </button>
      </div>
    );
  }

  return (
    <GameDashboard playerAddress={playerAddress} initialGameData={gameData} />
  );
}
