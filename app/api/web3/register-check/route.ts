import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { GameContract } from "@/lib/contracts/game-contract";
import {
  isSimulationMode,
  generateMockPlayerData,
} from "@/lib/simulation-mode";

const GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS;
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;
const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "sepolia";

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

    console.log(
      `[API] Checking if player is registered on blockchain: ${address}`
    );

    // ตรวจสอบว่าอยู่ในโหมดจำลองหรือไม่
    if (isSimulationMode()) {
      console.log("[API] Running in simulation mode");
      // สร้างข้อมูลจำลองแต่ไม่จำเป็นต้องใช้ในการตอบกลับ
      generateMockPlayerData(address);
      return NextResponse.json({
        success: true,
        isRegistered: true,
        address,
        simulated: true,
      });
    }

    // ตรวจสอบ contract address
    if (!GAME_CONTRACT_ADDRESS) {
      console.warn(
        "[API] Game contract address not found in environment variables"
      );
      // คืนค่า simulatedResponse เพื่อหลีกเลี่ยง error
      return NextResponse.json({
        success: true,
        isRegistered: true, // สมมติว่าลงทะเบียนแล้ว เพื่อให้ UX ดีขึ้น
        address,
        simulated: true,
      });
    }

    // สร้าง provider สำหรับเชื่อมต่อกับ blockchain
    let provider;
    let providerConnected = false;

    // ลองใช้ Alchemy ก่อนถ้ามี API Key
    if (ALCHEMY_API_KEY && ALCHEMY_API_KEY !== "your-alchemy-api-key") {
      try {
        provider = new ethers.AlchemyProvider(NETWORK, ALCHEMY_API_KEY);
        // ทดสอบการเชื่อมต่อ
        await provider.getBlockNumber();
        providerConnected = true;
        console.log("[API] Connected to Alchemy provider");
      } catch (error) {
        console.error("[API] Failed to connect to Alchemy:", error);
      }
    }

    // ถ้า Alchemy ไม่ทำงาน ลองใช้ Infura
    if (
      !providerConnected &&
      INFURA_API_KEY &&
      INFURA_API_KEY !== "your-infura-api-key"
    ) {
      try {
        provider = new ethers.InfuraProvider(NETWORK, INFURA_API_KEY);
        // ทดสอบการเชื่อมต่อ
        await provider.getBlockNumber();
        providerConnected = true;
        console.log("[API] Connected to Infura provider");
      } catch (error) {
        console.error("[API] Failed to connect to Infura:", error);
      }
    }

    // ถ้าทั้ง Alchemy และ Infura ไม่ทำงาน ลองใช้ public provider
    if (!providerConnected) {
      try {
        provider = new ethers.JsonRpcProvider(
          `https://${NETWORK}.publicnode.com`
        );
        // ทดสอบการเชื่อมต่อ
        await provider.getBlockNumber();
        providerConnected = true;
        console.log("[API] Connected to public provider");
      } catch (error) {
        console.error("[API] Failed to connect to public provider:", error);
      }
    }

    // ถ้าไม่สามารถเชื่อมต่อกับ provider ใด ๆ ให้คืนค่า simulatedResponse
    if (!providerConnected) {
      console.warn(
        "[API] No working provider found, falling back to simulation mode"
      );
      // สร้างข้อมูลจำลองแต่ไม่จำเป็นต้องใช้ในการตอบกลับ
      generateMockPlayerData(address);
      return NextResponse.json({
        success: true,
        isRegistered: true,
        address,
        simulated: true,
      });
    }

    // สร้าง contract instance
    const contract = new ethers.Contract(
      GAME_CONTRACT_ADDRESS,
      GameContract.abi,
      provider
    );

    // เรียกฟังก์ชันตรวจสอบการลงทะเบียนผู้เล่น
    let isRegistered = false;
    try {
      const playerData = await contract.getPlayerData(address);
      isRegistered = playerData.exists;
      console.log(`[API] Player registration status: ${isRegistered}`);
    } catch (error) {
      console.error("[API] Error checking player registration:", error);
      // คืนค่า simulatedResponse เมื่อไม่สามารถตรวจสอบได้
      return NextResponse.json({
        success: true,
        isRegistered: true, // สมมติว่าลงทะเบียนแล้ว เพื่อให้ UX ดีขึ้น
        address,
        simulated: true,
      });
    }

    return NextResponse.json({
      success: true,
      isRegistered,
      address,
    });
  } catch (error) {
    console.error("[API] Error in web3/register-check API:", error);
    // คืนค่า simulatedResponse เมื่อเกิด error
    // ดึง address จาก URL request อีกครั้ง
    let addressFromURL = null;
    try {
      const url = new URL(request.url);
      addressFromURL = url.searchParams.get("address");
    } catch (e) {
      console.error("[API] Error parsing URL:", e);
    }

    return NextResponse.json({
      success: true,
      isRegistered: true, // สมมติว่าลงทะเบียนแล้ว เพื่อให้ UX ดีขึ้น
      address: addressFromURL,
      simulated: true,
      error: "Internal server error, using simulated response",
    });
  }
}
