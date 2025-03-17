import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { loadGameData } from "@/lib/actions"
import WelcomeScreen from "@/components/welcome-screen"

export default async function Home() {
  // ตรวจสอบว่ามีกระเป๋าที่เชื่อมต่อแล้วหรือไม่
  const playerAddress = cookies().get("player_address")?.value

  // ถ้ามีกระเป๋าที่เชื่อมต่อแล้ว ให้โหลดข้อมูลเกม
  if (playerAddress) {
    try {
      const { success, data, error } = await loadGameData(playerAddress)

      if (success && data) {
        // เพิ่ม wallet address เข้าไปในข้อมูลเกม
        data.walletAddress = playerAddress

        // ถ้าโหลดข้อมูลสำเร็จ ให้ redirect ไปหน้า dashboard
        redirect("/dashboard")
      } else {
        console.error("Error loading game data:", error)
      }
    } catch (error) {
      console.error("Error loading game data:", error)
    }
  }

  // ถ้าไม่มีกระเป๋าที่เชื่อมต่อ หรือโหลดข้อมูลไม่สำเร็จ ให้แสดงหน้า welcome
  return <WelcomeScreen />
}

