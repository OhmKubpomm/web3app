import { NextResponse } from "next/server";
import { loadGameData } from "@/lib/actions";

export async function GET(request: Request) {
  try {
    // รับพารามิเตอร์ address จาก URL query
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Wallet address is required" },
        { status: 400 }
      );
    }

    console.log(`[API] Loading game data for address: ${address}`);

    // โหลดข้อมูลเกมของผู้เล่น
    const result = await loadGameData(address);

    if (!result.success) {
      console.error(`[API] Failed to load game data: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    console.log(`[API] Game data loaded successfully for ${address}`);

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error("[API] Error in game-data API:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
} 