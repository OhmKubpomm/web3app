"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAccount, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { toast } from "sonner";
import { setCookie, deleteCookie } from "cookies-next";

// ประเภทของ Web3 Context
interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  mintNFT: (tokenURI: string) => Promise<string | null>;
}

// สร้าง Context
const Web3Context = createContext<Web3ContextType | null>(null);

// ฟังก์ชันสำหรับใช้งาน Context
export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

// ฟังก์ชันสำหรับแปลง chainId เป็นชื่อเครือข่าย
export const getNetworkName = (chainId: number | null) => {
  if (!chainId) return "ไม่ทราบ";

  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    80001: "Mumbai Testnet",
    11155111: "Sepolia Testnet",
  };

  return networks[chainId] || `เครือข่าย ${chainId}`;
};

// Provider Component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, isConnecting, status } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();
  const [isInitialized, setIsInitialized] = useState(false);

  // เมื่อเชื่อมต่อหรือตัดการเชื่อมต่อ ให้อัปเดต cookie
  useEffect(() => {
    if (!isInitialized) return;

    if (isConnected && address) {
      // บันทึก address ลงใน cookie เมื่อเชื่อมต่อ
      setCookie("player_address", address, { maxAge: 30 * 24 * 60 * 60 }); // 30 วัน
      toast.success("เชื่อมต่อสำเร็จ", {
        description: `เชื่อมต่อกับกระเป๋า ${address.slice(
          0,
          6
        )}...${address.slice(-4)} แล้ว`,
        position: "top-right",
      });
    } else {
      // ลบ cookie เมื่อตัดการเชื่อมต่อ
      deleteCookie("player_address");
    }
  }, [isConnected, address, isInitialized]);

  // ตั้งค่า isInitialized เป็น true หลังจาก mount
  useEffect(() => {
    setIsInitialized(true);
  }, []);

  // ฟังก์ชันตัดการเชื่อมต่อ
  const disconnect = async () => {
    await disconnectAsync();
    deleteCookie("player_address");
    toast.info("ตัดการเชื่อมต่อแล้ว", {
      position: "top-right",
    });
  };

  // ฟังก์ชันเปลี่ยนเครือข่าย
  const switchNetwork = async (chainId: number) => {
    if (!switchChainAsync) {
      toast.error("ไม่สามารถเปลี่ยนเครือข่ายได้", {
        description: "กรุณาเปลี่ยนเครือข่ายในกระเป๋าของคุณ",
        position: "top-right",
      });
      return;
    }

    try {
      await switchChainAsync({ chainId });
      toast.success(`เปลี่ยนเครือข่ายเป็น ${getNetworkName(chainId)} แล้ว`, {
        position: "top-right",
      });
    } catch (error) {
      console.error("Error switching network:", error);
      toast.error("ไม่สามารถเปลี่ยนเครือข่ายได้", {
        position: "top-right",
      });
    }
  };

  // ฟังก์ชันสร้าง NFT (จำลอง)
  const mintNFT = async (tokenURI: string): Promise<string | null> => {
    if (!isConnected || !address) {
      toast.error("กรุณาเชื่อมต่อกระเป๋าก่อน", {
        position: "top-right",
      });
      return null;
    }

    try {
      // จำลองการสร้าง NFT สำเร็จ
      toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)", {
        description: `สร้าง NFT สำเร็จแล้ว`,
        position: "top-right",
      });

      return Math.floor(Math.random() * 1000000).toString();
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("ไม่สามารถสร้าง NFT ได้", {
        position: "top-right",
      });
      return null;
    }
  };

  const value = {
    address: address || null,
    chainId,
    isConnected,
    isConnecting: status === "connecting",
    disconnect,
    switchNetwork,
    mintNFT,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
