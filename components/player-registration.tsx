"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWeb3 } from "@/lib/web3-client";
import { ethers } from "ethers";
import { toast } from "sonner";
import { GameContract } from "@/lib/contracts/game-contract";
import { Loader2, UserPlus } from "lucide-react";

interface PlayerRegistrationProps {
  onRegistered: () => void;
}

export default function PlayerRegistration({
  onRegistered,
}: PlayerRegistrationProps) {
  const { address } = useWeb3();
  const [isRegistering, setIsRegistering] = useState(false);

  const registerPlayer = async () => {
    if (!address) {
      toast.error("กรุณาเชื่อมต่อกระเป๋าเงิน", {
        description: "คุณต้องเชื่อมต่อกระเป๋าเงินก่อนลงทะเบียน",
      });
      return;
    }

    setIsRegistering(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Avoid ENS in networks that don't support it
      provider.getResolver = async (name: string) => {
        return null;
      };

      const gameContract = new ethers.Contract(
        GameContract.address,
        GameContract.abi,
        signer
      );

      // Register player
      const tx = await gameContract.registerPlayer({
        gasLimit: 3000000, // Increase gas limit to prevent out of gas errors
      });

      toast.loading("กำลังลงทะเบียนผู้เล่น...", {
        id: "register-player",
        description: "กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลลงบล็อกเชน",
      });

      const receipt = await tx.wait();

      toast.success("ลงทะเบียนผู้เล่นสำเร็จ", {
        id: "register-player",
        description: "ยินดีต้อนรับสู่การผจญภัย!",
      });

      // Call the callback to notify parent component
      onRegistered();
    } catch (error: any) {
      console.error("Error registering player:", error);

      toast.error("ลงทะเบียนผู้เล่นไม่สำเร็จ", {
        id: "register-player",
        description: error.message || "เกิดข้อผิดพลาดในการลงทะเบียนผู้เล่น",
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-purple-400" />
          ลงทะเบียนผู้เล่นใหม่
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 text-center">
          <p className="mb-4">
            คุณยังไม่ได้ลงทะเบียนในเกม Adventure Clicker
            กรุณาลงทะเบียนเพื่อเริ่มการผจญภัย
          </p>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={registerPlayer}
            disabled={isRegistering || !address}
          >
            {isRegistering ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                กำลังลงทะเบียน...
              </>
            ) : (
              "ลงทะเบียนผู้เล่น"
            )}
          </Button>
        </div>
        <div className="mt-2 p-3 bg-black/30 rounded-md text-xs text-gray-400">
          <p>
            การลงทะเบียนจะสร้างข้อมูลผู้เล่นของคุณบนบล็อกเชน
            และให้ตัวละครเริ่มต้นพร้อมเริ่มการผจญภัย
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
