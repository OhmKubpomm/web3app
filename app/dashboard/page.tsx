import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import GameDashboard from "@/components/game-dashboard";
import { loadGameData } from "@/lib/actions";

export default async function DashboardPage() {
  // ตรวจสอบว่ามีกระเป๋าที่เชื่อมต่อแล้วหรือไม่จาก cookie
  const playerAddress = (await cookies()).get("player_address")?.value;

  // ถ้าไม่มีกระเป๋าที่เชื่อมต่อ ให้ redirect ไปหน้าแรก
  if (!playerAddress) {
    return redirect("/");
  }

  // โหลดข้อมูลเกมจากฐานข้อมูล
  const { success, data } = await loadGameData(playerAddress);

  // ถ้าโหลดข้อมูลไม่สำเร็จ ให้ redirect ไปหน้าแรก
  if (!success || !data) {
    return redirect("/");
  }

  // ส่งข้อมูลไปยัง GameDashboard component
  return <GameDashboard playerAddress={playerAddress} initialGameData={data} />;
}
