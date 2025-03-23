import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WelcomeScreen from "@/components/welcome-screen";

export default async function Home() {
  // ตรวจสอบว่ามีกระเป๋าที่เชื่อมต่อแล้วหรือไม่จาก cookie
  const playerAddress = cookies().get("player_address")?.value;

  // ถ้ามีกระเป๋าที่เชื่อมต่อแล้ว ให้ redirect ไปหน้า dashboard
  if (playerAddress) {
    return redirect("/dashboard");
  }

  // ถ้าไม่มีกระเป๋าที่เชื่อมต่อ ให้แสดงหน้า welcome
  return <WelcomeScreen />;
}
