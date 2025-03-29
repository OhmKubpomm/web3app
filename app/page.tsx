import { redirect } from "next/navigation";
import GameDashboard from "@/components/game-dashboard";
import { loadGameData } from "@/lib/actions";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  // ดึง address จาก cookie (ใช้ await เพื่อแก้ไขข้อผิดพลาด)
  const cookieStore = await cookies();
  const playerAddress = cookieStore.get("player_address")?.value;

  // ถ้าไม่มี address ให้ redirect ไปหน้าแรก
  if (!playerAddress) {
    redirect("/");
  }

  // โหลดข้อมูลเกมของผู้เล่น
  const { success, data, error } = await loadGameData(playerAddress);

  // ถ้าโหลดข้อมูลไม่สำเร็จ ให้ redirect ไปหน้าแรก
  if (!success || !data) {
    console.error("Error loading game data:", error);
    redirect("/");
  }

  return <GameDashboard playerAddress={playerAddress} initialGameData={data} />;
}
