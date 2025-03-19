import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { loadGameData } from "@/lib/actions"
import GameDashboard from "@/components/game-dashboard"

export default async function DashboardPage() {
  // ตรวจสอบว่ามีกระเป๋าที่เชื่อมต่อแล้วหรือไม่
  const playerAddress = cookies().get("player_address")?.value

  // ถ้าไม่มีกระเป๋าที่เชื่อมต่อ ให้ redirect ไปหน้าแรก
  if (!playerAddress) {
    return redirect("/")
  }

  // โหลดข้อมูลเกม
  const { success, data, error } = await loadGameData(playerAddress)

  if (!success || !data) {
    console.error("Error loading game data:", error)
    return redirect("/")
  }

  // เพิ่ม wallet address เข้าไปในข้อมูลเกม
  data.walletAddress = playerAddress

  // ส่งข้อมูลเกมไปให้ component
  return <GameDashboard initialGameData={data} />
}

