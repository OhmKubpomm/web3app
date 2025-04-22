import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { saveGameData } from "@/lib/actions";

export async function POST(request: Request) {
  try {
    // รับข้อมูล address จาก request body
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Saving player with address: ${address}`);

    // ตั้งค่า cookie ให้สามารถอ่านได้จาก JavaScript
    const response = NextResponse.json({ 
      success: true, 
      address,
      message: "Player data saved successfully" 
    });
    
    // ตั้งค่า cookie ด้วยค่า player_address เพื่อใช้ในการระบุตัวตนผู้เล่น
    response.cookies.set("player_address", address, {
      httpOnly: false, // ให้ JavaScript อ่านได้
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 วัน
      path: "/",
      sameSite: "lax"
    });

    console.log("[API] Cookie set in response");

    // บันทึกข้อมูลผู้เล่นลงฐานข้อมูล
    const initialGameData = {
      coins: 0,
      damage: 1,
      autoDamage: 0,
      currentArea: "ป่า",
    };

    const result = await saveGameData(address, initialGameData);

    if (!result.success) {
      console.error(`[API] Failed to save game data: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log("[API] Game data saved successfully");
    return response;
  } catch (error) {
    console.error("[API] Error in save-player API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 