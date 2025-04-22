import { cookies } from "next/headers";
import DashboardClient from "./page-client";

// กำหนด interface สำหรับข้อมูลเกม
interface GameData {
  playerAddress: string;
  level: number;
  experience: number;
  gold: number;
  coins: number;
  damage: number;
  autoDamage: number;
  currentArea: string;
  items: any[];
  lastUpdated: string;
}

// ฟังก์ชันสำหรับดึงข้อมูลเกมของผู้เล่นจากฐานข้อมูล
async function getInitialGameData(playerAddress: string): Promise<GameData | null> {
  try {
    console.log("Fetching initial game data for:", playerAddress);
    // จำลองการดึงข้อมูล - ปรับใช้ตามการเชื่อมต่อฐานข้อมูลจริง
    return {
      playerAddress,
      level: 1,
      experience: 0,
      gold: 100,
      coins: 0,
      damage: 1,
      autoDamage: 0,
      currentArea: "ป่า",
      items: [],
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error getting game data:", error);
    return null;
  }
}

export default async function DashboardPage() {
  console.log("Starting DashboardPage rendering");
  // ดึง player_address จาก cookies เพื่อใช้ตรวจสอบและดึงข้อมูลเริ่มต้น
  console.log("Before await cookies()");
  const cookieStore = await cookies();
  console.log("After await cookies()");
  const playerAddress = cookieStore.get("player_address")?.value;
  console.log("Player address from cookie:", playerAddress);
  
  // ถ้ามี player_address ใน cookie ให้ดึงข้อมูลเกมเริ่มต้น
  let initialGameData: GameData | null = null;
  if (playerAddress) {
    console.log("Fetching initial game data...");
    initialGameData = await getInitialGameData(playerAddress);
    console.log("Game data fetched:", initialGameData ? "success" : "failed");
  }
  
  // ส่งข้อมูลเริ่มต้นไปให้ Client Component
  console.log("Rendering DashboardClient with data:", initialGameData ? "exists" : "null");
  return <DashboardClient initialGameData={initialGameData} />;
}
