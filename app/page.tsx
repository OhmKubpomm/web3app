import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import WelcomeScreen from "@/components/welcome-screen"

// แก้ไขฟังก์ชัน Home ให้ทำงานได้อย่างถูกต้อง
export default async function Home() {
  // ตรวจสอบว่ามีกระเป๋าที่เชื่อมต่อแล้วหรือไม่
  const playerAddress = cookies().get("player_address")?.value

  // ถ้ามีกระเป๋าที่เชื่อมต่อแล้ว ให้ redirect ไปหน้า dashboard ทันที
  if (playerAddress) {
    return redirect("/dashboard")
  }

  // ถ้าไม่มีกระเป๋าที่เชื่อมต่อ ให้แสดงหน้า welcome
  return <WelcomeScreen />
}

