"use client";

import type React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useAccount, useChainId, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import {
  getGameContract,
  registerPlayer as clientRegisterPlayer,
  attackMonster as clientAttackMonster,
  multiAttack as clientMultiAttack,
  batchAttack as clientBatchAttack,
  changeArea as clientChangeArea,
  upgradeCharacter as clientUpgradeCharacter,
  batchUpgradeCharacters as clientBatchUpgradeCharacters,
  isPlayerRegistered as clientIsPlayerRegistered,
  simulateAttack,
  simulateMultiAttack,
  batchTransactions,
  autoTransactions,
  getProviderAndSigner,
} from "@/lib/contracts/game-client";

import {
  mintNFT as clientMintNFT,
  batchMintNFT as clientBatchMintNFT,
} from "@/lib/nft-client";

// นำเข้าฟังก์ชันจากโมดูลจำลอง
import { 
  isSimulationMode, 
  setSimulationMode,
  simulatePlayerRegistration,
  simulateAttack as mockAttack,
  simulateMintNFT as mockMintNFT
} from "@/lib/simulation-mode";

// เพิ่มตัวแปรเพื่อตรวจสอบสถานะการเชื่อมต่อ
let isWalletConnectInitialized = false;

// Web3 Context Type
interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  mintNFT: (metadata: any) => Promise<any>;
  batchMintNFT: (metadataArray: any[]) => Promise<any>;
  attackMonster: (monsterId: number) => Promise<any>;
  multiAttack: (attackCount: number) => Promise<any>;
  batchAttack: (monsterIds: number[]) => Promise<any>;
  upgradeCharacter: (characterId: number) => Promise<any>;
  batchUpgradeCharacters: (characterIds: number[]) => Promise<any>;
  changeArea: (newArea: string) => Promise<any>;
  gainExperience: (characterId: number, amount: number) => Promise<any>;
  registerPlayer: () => Promise<any>;
  isPlayerRegistered: (address: string) => Promise<boolean>;
  batchTransactions: (
    transactions: Array<{
      type:
        | "attack"
        | "multiAttack"
        | "batchAttack"
        | "upgradeCharacter"
        | "mintNFT"
        | "changeArea";
      params: any[];
    }>
  ) => Promise<any>;
  autoAttack: (
    monsterId: number,
    intervalSeconds: number,
    maxCount: number
  ) => Promise<any>;
  autoMultiAttack: (
    attackCount: number,
    intervalSeconds: number,
    maxCount: number
  ) => Promise<any>;
  autoBatchAttack: (
    monsterIds: number[],
    intervalSeconds: number,
    maxCount: number
  ) => Promise<any>;
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  mintNFT: async () => ({}),
  batchMintNFT: async () => ({}),
  attackMonster: async () => ({}),
  multiAttack: async () => ({}),
  batchAttack: async () => ({}),
  upgradeCharacter: async () => ({}),
  batchUpgradeCharacters: async () => ({}),
  changeArea: async () => ({}),
  gainExperience: async () => ({}),
  registerPlayer: async () => ({}),
  isPlayerRegistered: async () => false,
  batchTransactions: async () => ({}),
  autoAttack: async () => ({}),
  autoMultiAttack: async () => ({}),
  autoBatchAttack: async () => ({}),
});

// Hook for using Web3 Context
export const useWeb3 = () => useContext(Web3Context);

// Check if MetaMask is available
const hasMetaMask = () => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

// Check if chain is supported
const isSupportedChain = (chainId: number) => {
  return [1, 11155111, 137, 80001, 8453, 84532, 10143].includes(chainId);
};

// Get network name from chain ID
export const getNetworkName = (chainId: number | null) => {
  if (!chainId) return "ไม่ทราบ";

  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    80001: "Mumbai Testnet",
    11155111: "Sepolia Testnet",
    8453: "Base Mainnet",
    84532: "Base Sepolia",
    31337: "Hardhat Local",
    1337: "Local Network",
    10143: "Monad Testnet",
  };

  return networks[chainId] || `เครือข่าย ${chainId}`;
};

// UTF-8 to Base64 conversion with fallbacks
const utf8ToBase64 = (str: string) => {
  try {
    return Buffer.from(str).toString("base64");
  } catch (error) {
    console.error("Error encoding to base64:", error);
    try {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(Number.parseInt(p1, 16))
        )
      );
    } catch (e) {
      console.error("Fallback encoding failed:", e);
      return btoa("error_encoding_string");
    }
  }
};

// ฟังก์ชันสำหรับตรวจสอบการตั้งค่า Web3 ที่จำเป็น
const checkWeb3Configuration = () => {
  const errors = [];
  
  // ตรวจสอบ contract addresses
  if (!process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS) {
    errors.push("NEXT_PUBLIC_GAME_CONTRACT_ADDRESS ไม่ได้ถูกกำหนดค่าใน .env หรือ .env.local");
  }
  
  if (!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) {
    errors.push("NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ไม่ได้ถูกกำหนดค่าใน .env หรือ .env.local");
  }
  
  // ตรวจสอบ provider keys (ไม่จำเป็นในโหมดจำลอง)
  if (!isSimulationMode()) {
    if (!process.env.NEXT_PUBLIC_ALCHEMY_API_KEY && !process.env.NEXT_PUBLIC_INFURA_API_KEY) {
      errors.push("ไม่พบ API key สำหรับ Alchemy หรือ Infura ต้องกำหนดอย่างน้อยหนึ่งค่า");
    }
    
    if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID) {
      errors.push("NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ไม่ได้ถูกกำหนดค่าสำหรับการเชื่อมต่อ wallet");
    }
  }
  
  // ถ้ามีข้อผิดพลาด ให้แสดงคำเตือนใน console
  if (errors.length > 0) {
    console.warn("พบปัญหาในการตั้งค่า Web3:", errors);
    
    // ถ้าไม่ได้อยู่ในโหมดจำลอง แต่มีข้อผิดพลาดในการตั้งค่า ให้เปิดใช้โหมดจำลองโดยอัตโนมัติ
    if (!isSimulationMode()) {
      console.warn("กำลังเปิดใช้งานโหมดจำลองโดยอัตโนมัติเนื่องจากพบปัญหาในการตั้งค่า");
      setSimulationMode(true);
    }
  }
  
  return errors.length === 0;
};

// ฟังก์ชันสำหรับพยายามรับ provider จากหลายแหล่งข้อมูล
const getProviderFallback = async () => {
  let provider = null;
  const network = process.env.NEXT_PUBLIC_NETWORK || "sepolia";
  const errors = [];
  
  // 1. ลองใช้ Alchemy ก่อน
  if (process.env.NEXT_PUBLIC_ALCHEMY_API_KEY) {
    try {
      provider = new ethers.AlchemyProvider(network, process.env.NEXT_PUBLIC_ALCHEMY_API_KEY);
      // ทดสอบการเชื่อมต่อ
      await provider.getBlockNumber();
      console.log("เชื่อมต่อกับ Alchemy สำเร็จ");
      return provider;
    } catch (error) {
      errors.push(`ไม่สามารถเชื่อมต่อกับ Alchemy: ${error}`);
    }
  }
  
  // 2. ลองใช้ Infura ถ้า Alchemy ไม่สำเร็จ
  if (process.env.NEXT_PUBLIC_INFURA_API_KEY) {
    try {
      provider = new ethers.InfuraProvider(network, process.env.NEXT_PUBLIC_INFURA_API_KEY);
      // ทดสอบการเชื่อมต่อ
      await provider.getBlockNumber();
      console.log("เชื่อมต่อกับ Infura สำเร็จ");
      return provider;
    } catch (error) {
      errors.push(`ไม่สามารถเชื่อมต่อกับ Infura: ${error}`);
    }
  }
  
  // 3. ลองใช้ public provider ถ้าทั้ง Alchemy และ Infura ไม่สำเร็จ
  try {
    const publicRpcUrl = `https://${network}.publicnode.com`;
    provider = new ethers.JsonRpcProvider(publicRpcUrl);
    // ทดสอบการเชื่อมต่อ
    await provider.getBlockNumber();
    console.log("เชื่อมต่อกับ public provider สำเร็จ");
    return provider;
  } catch (error) {
    errors.push(`ไม่สามารถเชื่อมต่อกับ public provider: ${error}`);
  }
  
  // 4. ถ้าทั้งหมดล้มเหลว ลองใช้ provider เริ่มต้น
  try {
    provider = new ethers.JsonRpcProvider();
    await provider.getBlockNumber();
    return provider;
  } catch (error) {
    errors.push(`ไม่สามารถเชื่อมต่อกับ default provider: ${error}`);
  }
  
  // ถ้าไม่สามารถเชื่อมต่อกับ provider ใดๆ ได้
  console.error("ไม่สามารถเชื่อมต่อกับ provider ใดๆ ได้:", errors);
  throw new Error("ไม่สามารถเชื่อมต่อกับ blockchain ได้: กรุณาตรวจสอบการเชื่อมต่อหรือเปิดใช้โหมดจำลอง");
};

// Web3 Provider Component
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [isConnecting, setIsConnecting] = useState(false);
  const [localAddress, setLocalAddress] = useState<string | null>(null);
  const [localChainId, setLocalChainId] = useState<number | null>(null);
  const [localIsConnected, setLocalIsConnected] = useState(false);
  const [transactions, setTransactions] = useState<Record<string, any>>({});
  const [autoAttackStopFunctions, setAutoAttackStopFunctions] = useState<
    Record<string, () => any>
  >({});

  // Update local state when wagmi state changes
  useEffect(() => {
    if (address) {
      setLocalAddress(address);
      setLocalIsConnected(isConnected);
    } else {
      setLocalAddress(null);
      setLocalIsConnected(false);
    }
  }, [address, isConnected]);

  useEffect(() => {
    if (chainId) {
      setLocalChainId(chainId);
    } else {
      setLocalChainId(null);
    }
  }, [chainId]);

  // ตรวจสอบการตั้งค่า Web3 เมื่อ component ถูกโหลด
  useEffect(() => {
    checkWeb3Configuration();
  }, []);

  // Connect to wallet
  const connect = async () => {
    if (!hasMetaMask() && !openConnectModal) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเชื่อมต่อกระเป๋าเงิน",
      });
      return;
    }

    try {
      setIsConnecting(true);

      // ตรวจสอบว่ามีการเชื่อมต่อแล้วหรือไม่
      if (isWalletConnectInitialized && openConnectModal) {
        openConnectModal();
        return;
      }

      if (openConnectModal) {
        isWalletConnectInitialized = true;
        openConnectModal();
      } else {
        // Fallback if RainbowKit doesn't work
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);

        if (accounts.length === 0) {
          throw new Error("ไม่พบบัญชี");
        }

        const network = await provider.getNetwork();
        const currentChainId = Number(network.chainId);

        setLocalAddress(accounts[0]);
        setLocalChainId(currentChainId);
        setLocalIsConnected(true);

        // Save connection state to localStorage
        localStorage.setItem("walletConnected", "true");
        
        // บันทึก address ลงใน cookie
        document.cookie = `player_address=${accounts[0]}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;

        // เรียกใช้ saveGameData API เพื่อสร้างข้อมูลผู้เล่นใหม่หรืออัพเดตข้อมูลเดิม
        try {
          const response = await fetch("/api/save-player", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ address: accounts[0] }),
          });
          
          if (!response.ok) {
            console.warn("ไม่สามารถบันทึกข้อมูลผู้เล่นได้");
          } else {
            // แสดงข้อความเชื่อมต่อสำเร็จ
            toast.success("เชื่อมต่อสำเร็จ", {
              description: `เชื่อมต่อกับกระเป๋าเงิน ${accounts[0].slice(
                0,
                6
              )}...${accounts[0].slice(-4)} บนเครือข่าย ${getNetworkName(
                currentChainId
              )}`,
            });
          }
        } catch (error) {
          console.error("Error saving player data:", error);
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      toast.error("การเชื่อมต่อล้มเหลว", {
        description: "ไม่สามารถเชื่อมต่อกระเป๋าเงินได้ กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    if (disconnectAsync) {
      disconnectAsync();
    }

    setLocalAddress(null);
    setLocalChainId(null);
    setLocalIsConnected(false);
    localStorage.removeItem("walletConnected");
    
    // ลบ cookie player_address
    document.cookie = "player_address=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";

    // หยุดการทำงานของ autoAttack ทั้งหมด
    Object.values(autoAttackStopFunctions).forEach((stopFn) => {
      if (typeof stopFn === "function") {
        stopFn();
      }
    });
    setAutoAttackStopFunctions({});

    toast.success("ตัดการเชื่อมต่อแล้ว", {
      description: "ตัดการเชื่อมต่อกับกระเป๋าเงินแล้ว",
    });
  };

  // Switch network
  const switchNetwork = async (targetChainId: number) => {
    if (!hasMetaMask()) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเปลี่ยนเครือข่าย",
      });
      return;
    }

    try {
      // Network parameters
      const networkParams: Record<number, any> = {
        1: {
          chainId: "0x1", // Ethereum Mainnet
        },
        137: {
          chainId: "0x89", // Polygon
          chainName: "Polygon Mainnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://polygon-rpc.com/"],
          blockExplorerUrls: ["https://polygonscan.com/"],
        },
        80001: {
          chainId: "0x13881", // Mumbai Testnet
          chainName: "Mumbai Testnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        },
        11155111: {
          chainId: "0xaa36a7", // Sepolia Testnet
          chainName: "Sepolia Testnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://rpc.sepolia.org/"],
          blockExplorerUrls: ["https://sepolia.etherscan.io/"],
        },
        8453: {
          chainId: "0x2105", // Base Mainnet
          chainName: "Base Mainnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://mainnet.base.org"],
          blockExplorerUrls: ["https://basescan.org/"],
        },
        84532: {
          chainId: "0x14a34", // Base Sepolia
          chainName: "Base Sepolia",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org/"],
        },
        10143: {
          chainId: "0x279f", // Monad Testnet
          chainName: "Monad Testnet",
          nativeCurrency: {
            name: "MON",
            symbol: "MON",
            decimals: 18,
          },
          rpcUrls: ["https://testnet-rpc.monad.xyz"],
          blockExplorerUrls: ["https://testnet.monadexplorer.com"],
        },
      };

      // Convert chainId to hex
      const chainIdHex = `0x${targetChainId.toString(16)}`;

      try {
        // Try to switch to existing network
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // Network doesn't exist in wallet
        if (switchError.code === 4902) {
          // Add new network
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[targetChainId]],
          });
        } else {
          throw switchError;
        }
      }

      // Update chainId
      setLocalChainId(targetChainId);

      toast.success("เปลี่ยนเครือข่ายสำเร็จ", {
        description: `เปลี่ยนเครือข่ายเป็น ${getNetworkName(
          targetChainId
        )} แล้ว`,
      });
    } catch (error: any) {
      console.error("Error switching network:", error);
      toast.error("เปลี่ยนเครือข่ายไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนเครือข่าย",
      });
    }
  };

  // Check if player is registered
  const isPlayerRegistered = async (
    playerAddress: string
  ): Promise<boolean> => {
    try {
      if (!playerAddress) return false;
      
      // ตรวจสอบโหมดจำลอง
      if (isSimulationMode()) {
        console.log("Using simulation mode for player registration check");
        return true; // สมมติว่าลงทะเบียนแล้วในโหมดจำลอง
      }
      
      // ตรวจสอบบน blockchain จริง
      return await clientIsPlayerRegistered(playerAddress);
    } catch (error) {
      console.error("Error checking player registration:", error);
      
      // ในกรณีที่มีข้อผิดพลาด ให้แสดงข้อความที่เป็นประโยชน์
      let errorMessage = "ไม่สามารถตรวจสอบการลงทะเบียนผู้เล่นได้";
      
      if (error instanceof Error) {
        // ตรวจสอบว่าเป็นข้อผิดพลาดจากการเชื่อมต่อหรือไม่
        if (error.message.includes("network") || error.message.includes("provider")) {
          errorMessage += ": ปัญหาการเชื่อมต่อกับ blockchain";
          toast.error(errorMessage, {
            description: "กำลังใช้ข้อมูลแบบออฟไลน์แทน",
          });
          
          // เปิดใช้โหมดจำลองโดยอัตโนมัติ
          setSimulationMode(true);
          return true; // สมมติว่าลงทะเบียนแล้ว
        }
      }
      
      return false;
    }
  };

  // Register player
  const registerPlayer = async () => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนลงทะเบียน",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // ตรวจสอบโหมดจำลอง
      if (isSimulationMode()) {
        console.log("Using simulation mode for player registration");
        const result = simulatePlayerRegistration(localAddress);
        toast.success("ลงทะเบียนผู้เล่นสำเร็จ (โหมดจำลอง)", {
          description: "ยินดีต้อนรับสู่การผจญภัย!",
        });
        return { 
          success: true, 
          txHash: result.txHash,
          simulated: true 
        };
      }

      // การตรวจสอบ contract address
      if (!process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS) {
        console.error("Game contract address not found in environment variables");
        toast.error("ข้อผิดพลาดในการตั้งค่า", {
          description: "ไม่พบที่อยู่ของ contract ในการตั้งค่า กำลังใช้โหมดจำลองแทน",
        });
        
        // เปิดใช้โหมดจำลองอัตโนมัติ
        setSimulationMode(true);
        
        // ใช้การจำลองแทน
        const result = simulatePlayerRegistration(localAddress);
        return { 
          success: true, 
          txHash: result.txHash,
          simulated: true 
        };
      }

      // Create Provider and Signer
      try {
        const { signer } = await getProviderAndSigner();

        // Check if already registered
        const isRegistered = await isPlayerRegistered(localAddress);
        if (isRegistered) {
          return { success: true, message: "ผู้เล่นลงทะเบียนแล้ว" };
        }

        // Register player
        const toastId = toast.loading("กำลังลงทะเบียนผู้เล่น...", {
          description: "กรุณารอสักครู่ ระบบกำลังบันทึกข้อมูลลงบล็อกเชน",
        });

        try {
          const receipt = await clientRegisterPlayer(signer);

          toast.success("ลงทะเบียนผู้เล่นสำเร็จ", {
            id: toastId,
            description: "ยินดีต้อนรับสู่การผจญภัย!",
          });

          return { success: true, txHash: receipt.hash };
        } catch (txError: any) {
          console.error("Transaction error:", txError);

          // จัดการกับข้อผิดพลาดที่เฉพาะเจาะจงยิ่งขึ้น
          if (txError.code === 4001) {
            toast.error("การลงทะเบียนถูกยกเลิก", {
              id: toastId,
              description: "คุณได้ยกเลิกการลงทะเบียน",
            });
            return { success: false, error: "User rejected transaction" };
          } else if (txError.code === "INSUFFICIENT_FUNDS") {
            toast.error("เหรียญ ETH ไม่เพียงพอ", {
              id: toastId,
              description: "คุณมีเหรียญ ETH ไม่เพียงพอสำหรับค่า gas ในการทำธุรกรรม",
            });
            return { success: false, error: "Insufficient funds for gas" };
          } else if (txError.message && txError.message.includes("gas required exceeds")) {
            toast.error("ค่า gas สูงเกินไป", {
              id: toastId,
              description: "ธุรกรรมต้องการค่า gas สูงเกินไป ลองอีกครั้งในภายหลัง",
            });
            return { success: false, error: "Gas limit exceeded" };
          }

          toast.error("การลงทะเบียนล้มเหลว", {
            id: toastId,
            description: "เกิดข้อผิดพลาดในการทำธุรกรรม กรุณาลองใหม่อีกครั้ง",
          });
          return { success: false, error: txError.message || "Transaction failed" };
        }
      } catch (providerError: any) {
        console.error("Provider error:", providerError);
        
        // เปิดใช้โหมดจำลองอัตโนมัติเมื่อเกิดข้อผิดพลาดจาก provider
        toast.error("ไม่สามารถเชื่อมต่อกับ blockchain ได้", {
          description: "กำลังเปิดใช้โหมดจำลองโดยอัตโนมัติ",
        });
        
        setSimulationMode(true);
        
        // ใช้การจำลองแทน
        const result = simulatePlayerRegistration(localAddress);
        return { 
          success: true, 
          txHash: result.txHash,
          simulated: true 
        };
      }
    } catch (error: any) {
      console.error("Error in register player:", error);
      toast.error("การลงทะเบียนล้มเหลว", {
        description:
          error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      });
      
      return { success: false, error: error.message || "Unknown error" };
    }
  };

  // Add experience to character (simulation since contract doesn't have this function)
  const gainExperience = async (characterId: number, amount: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนเพิ่มประสบการณ์",
      });
      return null;
    }

    try {
      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        await registerPlayer();
      }

      // Store the experience in localStorage to persist between sessions
      const storageKey = `character_${characterId}_xp_${localAddress}`;
      let currentXP = 0;

      try {
        const storedXP = localStorage.getItem(storageKey);
        if (storedXP) {
          currentXP = Number.parseInt(storedXP, 10);
        }
      } catch (e) {
        console.error("Error reading XP from localStorage:", e);
      }

      // Add new XP
      const newXP = currentXP + amount;

      // Save to localStorage
      try {
        localStorage.setItem(storageKey, newXP.toString());
      } catch (e) {
        console.error("Error saving XP to localStorage:", e);
      }

      // Calculate if level up occurred (simple formula: level up every 100 XP)
      const oldLevel = Math.floor(currentXP / 100);
      const newLevel = Math.floor(newXP / 100);
      const leveledUp = newLevel > oldLevel;

      if (leveledUp) {
        toast.success("เลเวลอัพ!", {
          description: `ตัวละครของคุณได้เลื่อนขั้นเป็นเลเวล ${newLevel}`,
        });
      }

      return {
        success: true,
        xpGained: amount,
        newLevel: leveledUp,
        totalXP: newXP,
        level: newLevel,
      };
    } catch (error: any) {
      console.error("Error gaining experience:", error);
      toast.error("เพิ่มประสบการณ์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเพิ่มประสบการณ์",
      });

      // Return a fallback result even on error so UI doesn't break
      return {
        success: false,
        xpGained: 0,
        newLevel: false,
        error: error.message,
      };
    }
  };

  // Mint NFT
  const mintNFT = async (metadata: any) => {
    try {
      // ถ้าอยู่ในโหมดจำลอง ให้ใช้ฟังก์ชันจำลองแทน
      if (isSimulationMode()) {
        console.log("กำลังใช้โหมดจำลองสำหรับ mintNFT");
        const toastId = toast.loading("กำลังสร้าง NFT...");
        
        // Extract metadata components for simulation
        const { uri, name, description, image } = metadata;
        
        // สร้าง NFT ในโหมดจำลอง โดยส่งพารามิเตอร์ที่จำเป็น
        const result = await mockMintNFT(
          localAddress || "0xSimulatedAddress", 
          uri || "", 
          name || "Unnamed NFT", 
          description || "No description",
          image
        );
        
        toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)!", { id: toastId });
        return result;
      }

      if (!localAddress) {
        await connect();
        return;
      }

      setIsConnecting(true);
      const toastId = toast.loading("กำลังสร้าง NFT...");

      try {
        // Check if player is registered first
        const isRegistered = await isPlayerRegistered(localAddress);
        if (!isRegistered) {
          await registerPlayer();
        }

        // Get current provider and signer
        const { signer } = await getProviderAndSigner();
        
        // Log transaction details for debugging
        console.log("Minting NFT with metadata:", metadata);
        console.log("Using contract address:", process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS);
        console.log("From address:", localAddress);
        
        // Increase gas limit to avoid reverts
        const result = await clientMintNFT(signer, localAddress, metadata);
        
        toast.success("สร้าง NFT สำเร็จ!", { id: toastId });
        return result;
      } catch (error: any) {
        console.error("Error minting NFT:", error);
        
        // ถ้าเกิดข้อผิดพลาดให้ลองใช้โหมดจำลองแทน
        if (error.code && (error.code === "NETWORK_ERROR" || error.code === "UNPREDICTABLE_GAS_LIMIT" || error.code === "INSUFFICIENT_FUNDS")) {
          console.log("เกิดข้อผิดพลาดในการเชื่อมต่อบล็อกเชน กำลังใช้โหมดจำลองแทน");
          
          // Extract metadata components for simulation
          const { uri, name, description, image } = metadata;
          
          const result = await mockMintNFT(
            localAddress || "0xSimulatedAddress", 
            uri || "", 
            name || "Unnamed NFT", 
            description || "No description",
            image
          );
          
          toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)!", { id: toastId });
          return result;
        }
        
        // Detailed error handling for different scenarios
        if (error.code === "ACTION_REJECTED") {
          toast.error("การสร้าง NFT ถูกยกเลิก", {
            id: toastId,
            description: "คุณปฏิเสธการทำธุรกรรมใน wallet",
          });
        } else if (error.code === "CALL_EXCEPTION") {
          toast.error("การสร้าง NFT ล้มเหลว", {
            id: toastId,
            description: "เกิดข้อผิดพลาดในสัญญาอัจฉริยะ: " + 
              (error.reason || "อาจไม่มีสิทธิ์หรือไม่มี gas เพียงพอ"),
          });
        } else {
          toast.error("การสร้าง NFT ล้มเหลว", {
            id: toastId,
            description: error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
          });
        }
        throw error;
      } finally {
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error in mintNFT function:", error);
      throw error;
    }
  };

  // Batch Mint NFT
  const batchMintNFT = async (metadataArray: any[]) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนสร้าง NFT",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Show toast when transaction starts
      const toastId = toast.loading(`กำลังสร้าง ${metadataArray.length} NFTs`, {
        description: "กำลังรอการยืนยันจากบล็อกเชน...",
      });

      try {
        // Call batchMintNFT function
        const result = await clientBatchMintNFT(
          signer,
          localAddress,
          metadataArray
        );

        // Update toast when successful
        toast.success(`สร้าง ${result.tokenIds.length} NFTs สำเร็จ`, {
          id: toastId,
        });

        return result;
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การสร้าง NFT ถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return { success: false, error: "User rejected transaction" };
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log("Transaction reverted, checking for more details");

          toast.error(`การสร้าง NFT หลายชิ้นล้มเหลว`, {
            id: toastId,
            description:
              "ธุรกรรมถูกยกเลิกบนบล็อกเชน กรุณาตรวจสอบว่าคุณมีสิทธิ์ในการสร้าง NFT",
          });

          // Create simulated NFTs for better UX
          const simulatedTokenIds = Array.from(
            { length: metadataArray.length },
            (_, i) => Math.floor(Math.random() * 1000) + 1000 + i
          );

          return {
            success: true,
            tokenIds: simulatedTokenIds,
            txHash: "0x" + Math.random().toString(16).substring(2, 42),
            simulated: true,
          };
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error batch minting NFTs:", error);
      toast.error("สร้าง NFT หลายชิ้นไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการสร้าง NFT",
      });

      return { success: false, error: error.message };
    }
  };

  // Attack monster
  const attackMonster = async (monsterId: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีมอนสเตอร์",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(`กำลังโจมตีมอนสเตอร์...`, {
        description: "กำลังรอการยืนยันจากบล็อกเชน...",
      });

      try {
        // Call attack function
        const receipt = await clientAttackMonster(signer, monsterId);

        // Update toast when successful
        toast.success(`โจมตีมอนสเตอร์สำเร็จ`, {
          id: toastId,
        });

        // Get data from event or return value
        const result = {
          damage: 5, // Default value
          defeated: false,
          reward: 0,
        };

        // Check events that occurred
        for (const log of receipt.logs) {
          try {
            const contract = await getGameContract(signer);
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "AttackPerformed") {
              result.damage = Number(parsedLog.args.damage);
              result.defeated = parsedLog.args.defeated;
            } else if (parsedLog && parsedLog.name === "MonsterDefeated") {
              result.defeated = true;
              result.reward = Number(parsedLog.args.reward);
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }

        return result;
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การโจมตีถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log("Attack transaction reverted, using fallback simulation");

          toast.error(`การโจมตีล้มเหลว`, {
            id: toastId,
            description: "ใช้โหมดจำลองแทน (ไม่ได้บันทึกลงบล็อกเชน)",
          });

          // Use simulation as fallback
          return await mockAttack(monsterId, 5);
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error attacking monster:", error);
      toast.error("โจมตีมอนสเตอร์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการโจมตีมอนสเตอร์",
      });
      return null;
    }
  };

  // Multi-attack
  const multiAttack = async (attackCount: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีมอนสเตอร์",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(`กำลังโจมตีมอนสเตอร์หลายตัว...`, {
        description: "กำลังรอการยืนยันจากบล็อกเชน...",
      });

      try {
        // Call multiAttack function
        const receipt = await clientMultiAttack(signer, attackCount);

        // Update toast when successful
        toast.success(`โจมตีมอนสเตอร์หลายตัวสำเร็จ`, {
          id: toastId,
        });

        // Get data from event or return value
        const result = {
          totalDamage: 0,
          monstersDefeated: 0,
          totalReward: 0,
        };

        // Check events that occurred
        for (const log of receipt.logs) {
          try {
            const contract = await getGameContract(signer);
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "MultiAttackPerformed") {
              result.totalDamage = Number(parsedLog.args.totalDamage);
              result.monstersDefeated = Number(parsedLog.args.monstersDefeated);
            } else if (parsedLog && parsedLog.name === "MonsterDefeated") {
              result.totalReward += Number(parsedLog.args.reward);
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }

        return result;
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การโจมตีถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log(
            "Transaction reverted, using fallback multi-attack simulation"
          );

          toast.error(`การโจมตีหลายครั้งล้มเหลว`, {
            id: toastId,
            description: "ใช้โหมดจำลองแทน (ไม่ได้บันทึกลงบล็อกเชน)",
          });

          // Use simulation as fallback
          return await mockAttack(attackCount, 5);
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error multi-attacking:", error);
      toast.error("โจมตีมอนสเตอร์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการโจมตีมอนสเตอร์",
      });
      return null;
    }
  };

  // Batch Attack
  const batchAttack = async (monsterIds: number[]) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีมอนสเตอร์",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(
        `กำลังโจมตีมอนสเตอร์ ${monsterIds.length} ตัว...`,
        {
          description: "กำลังรอการยืนยันจากบล็อกเชน...",
        }
      );

      try {
        // Call batchAttack function
        const receipt = await clientBatchAttack(signer, monsterIds);

        // Update toast when successful
        toast.success(`โจมตีมอนสเตอร์ ${monsterIds.length} ตัวสำเร็จ`, {
          id: toastId,
        });

        // Get data from event or return value
        const result = {
          totalDamage: 0,
          monstersDefeated: 0,
          totalReward: 0,
        };

        // Check events that occurred
        for (const log of receipt.logs) {
          try {
            const contract = await getGameContract(signer);
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "MultiAttackPerformed") {
              result.totalDamage = Number(parsedLog.args.totalDamage);
              result.monstersDefeated = Number(parsedLog.args.monstersDefeated);
            } else if (parsedLog && parsedLog.name === "MonsterDefeated") {
              result.totalReward += Number(parsedLog.args.reward);
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }

        return result;
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การโจมตีถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log(
            "Transaction reverted, using fallback batch attack simulation"
          );

          toast.error(`การโจมตีหลายตัวล้มเหลว`, {
            id: toastId,
            description: "ใช้โหมดจำลองแทน (ไม่ได้บันทึกลงบล็อกเชน)",
          });

          // Use simulation as fallback
          return await mockAttack(monsterIds.length, 5);
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error batch attacking:", error);
      toast.error("โจมตีมอนสเตอร์หลายตัวไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการโจมตีมอนสเตอร์",
      });
      return null;
    }
  };

  // Upgrade character
  const upgradeCharacter = async (characterId: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนอัพเกรดตัวละคร",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(`กำลังอัพเกรดตัวละคร...`, {
        description: "กำลังรอการยืนยันจากบล็อกเชน...",
      });

      try {
        // Call upgradeCharacter function
        const receipt = await clientUpgradeCharacter(signer, characterId);

        // Update toast when successful
        toast.success(`อัพเกรดตัวละครสำเร็จ`, {
          id: toastId,
        });

        // Get data from event or return value
        const result = {
          newLevel: 0,
          cost: 0,
        };

        // Check events that occurred
        for (const log of receipt.logs) {
          try {
            const contract = await getGameContract(signer);
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "CharacterUpgraded") {
              result.newLevel = Number(parsedLog.args.newLevel);
              result.cost = Number(parsedLog.args.cost);
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }

        return result;
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การอัพเกรดถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log("Transaction reverted, upgrade failed");

          toast.error(`การอัพเกรดตัวละครล้มเหลว`, {
            id: toastId,
            description:
              "ธุรกรรมถูกยกเลิกบนบล็อกเชน กรุณาตรวจสอบว่าคุณมีเหรียญเพียงพอ",
          });

          return null;
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error upgrading character:", error);
      toast.error("อัพเกรดตัวละครไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการอัพเกรดตัวละคร",
      });
      return null;
    }
  };

  // Batch Upgrade Characters
  const batchUpgradeCharacters = async (characterIds: number[]) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนอัพเกรดตัวละคร",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(
        `กำลังอัพเกรดตัวละคร ${characterIds.length} ตัว...`,
        {
          description: "กำลังรอการยืนยันจากบล็อกเชน...",
        }
      );

      try {
        // Call batchUpgradeCharacters function
        const receipt = await clientBatchUpgradeCharacters(
          signer,
          characterIds
        );

        // Update toast when successful
        toast.success(`อัพเกรดตัวละคร ${characterIds.length} ตัวสำเร็จ`, {
          id: toastId,
        });

        // Get total cost from event or return value
        let totalCost = 0;

        // Check events that occurred
        for (const log of receipt.logs) {
          try {
            const contract = await getGameContract(signer);
            const parsedLog = contract.interface.parseLog(log);
            if (parsedLog && parsedLog.name === "CharacterUpgraded") {
              totalCost += Number(parsedLog.args.cost);
            }
          } catch (e) {
            // Skip logs that can't be parsed
          }
        }

        return {
          success: true,
          totalCost,
          characterIds,
        };
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การอัพเกรดถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log("Transaction reverted, batch upgrade failed");

          toast.error(`การอัพเกรดตัวละครหลายตัวล้มเหลว`, {
            id: toastId,
            description:
              "ธุรกรรมถูกยกเลิกบนบล็อกเชน กรุณาตรวจสอบว่าคุณมีเหรียญเพียงพอ",
          });

          return null;
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error batch upgrading characters:", error);
      toast.error("อัพเกรดตัวละครหลายตัวไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการอัพเกรดตัวละคร",
      });
      return null;
    }
  };

  // Change area
  const changeArea = async (newArea: string) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนเปลี่ยนพื้นที่",
      });
      return null;
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // Check if player is registered
      const isRegistered = await isPlayerRegistered(localAddress);
      if (!isRegistered) {
        // Register player if not registered
        const registerResult = await registerPlayer();
        if (!registerResult.success) {
          throw new Error("ไม่สามารถลงทะเบียนผู้เล่นได้");
        }
      }

      // Show toast when transaction starts
      const toastId = toast.loading(`กำลังเปลี่ยนพื้นที่...`, {
        description: "กำลังรอการยืนยันจากบล็อกเชน...",
      });

      try {
        // Call changeArea function
        const receipt = await clientChangeArea(signer, newArea);

        // Update toast when successful
        toast.success(`เปลี่ยนพื้นที่สำเร็จ`, {
          id: toastId,
          description: `ย้ายไปยังพื้นที่ ${newArea} แล้ว`,
        });

        return {
          success: true,
          area: newArea,
        };
      } catch (txError: any) {
        console.error("Transaction error:", txError);

        // Handle user rejection
        if (txError.code === 4001) {
          // User rejected transaction
          toast.error("การเปลี่ยนพื้นที่ถูกยกเลิก", {
            id: toastId,
            description: "คุณได้ยกเลิกการทำธุรกรรม",
          });
          return null;
        }

        // Handle transaction reverted
        if (txError.message && txError.message.includes("CALL_EXCEPTION")) {
          console.log("Transaction reverted, area change failed");

          toast.error(`การเปลี่ยนพื้นที่ล้มเหลว`, {
            id: toastId,
            description:
              "ธุรกรรมถูกยกเลิกบนบล็อกเชน กรุณาตรวจสอบว่าพื้นที่มีอยู่จริง",
          });

          // Return simulated success for better UX
          return {
            success: true,
            area: newArea,
            simulated: true,
          };
        }

        throw txError;
      }
    } catch (error: any) {
      console.error("Error changing area:", error);
      toast.error("เปลี่ยนพื้นที่ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนพื้นที่",
      });
      return null;
    }
  };

  // Batch Transactions
  const handleBatchTransactions = async (
    transactions: Array<{
      type:
        | "attack"
        | "multiAttack"
        | "batchAttack"
        | "upgradeCharacter"
        | "mintNFT"
        | "changeArea";
      params: any[];
    }>
  ) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนทำธุรกรรม",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      return await batchTransactions(signer, transactions);
    } catch (error: any) {
      console.error("Error in batch transactions:", error);
      toast.error("ทำธุรกรรมหลายรายการไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการทำธุรกรรม",
      });
      return { success: false, error: error.message };
    }
  };

  // Auto Attack
  const autoAttack = async (
    monsterId: number,
    intervalSeconds: number,
    maxCount: number
  ) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีอัตโนมัติ",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // สร้าง ID สำหรับการโจมตีอัตโนมัตินี้
      const autoAttackId = `attack_${monsterId}_${Date.now()}`;

      // เริ่มการโจมตีอัตโนมัติ
      const controller = await autoTransactions(
        signer,
        { type: "attack", params: [monsterId] },
        intervalSeconds,
        maxCount
      );

      // เก็บฟังก์ชันสำหรับหยุดการโจมตีอัตโนมัติ
      setAutoAttackStopFunctions((prev) => ({
        ...prev,
        [autoAttackId]: controller.stop,
      }));

      return {
        success: true,
        autoAttackId,
        stop: () => {
          const result = controller.stop();

          // ลบฟังก์ชันหยุดออกจาก state
          setAutoAttackStopFunctions((prev) => {
            const newState = { ...prev };
            delete newState[autoAttackId];
            return newState;
          });

          return result;
        },
      };
    } catch (error: any) {
      console.error("Error starting auto attack:", error);
      toast.error("เริ่มการโจมตีอัตโนมัติไม่สำเร็จ", {
        description:
          error.message || "เกิดข้อผิดพลาดในการเริ่มการโจมตีอัตโนมัติ",
      });
      return { success: false, error: error.message };
    }
  };

  // Auto Multi Attack
  const autoMultiAttack = async (
    attackCount: number,
    intervalSeconds: number,
    maxCount: number
  ) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีอัตโนมัติ",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // สร้าง ID สำหรับการโจมตีอัตโนมัตินี้
      const autoAttackId = `multi_attack_${attackCount}_${Date.now()}`;

      // เริ่มการโจมตีอัตโนมัติ
      const controller = await autoTransactions(
        signer,
        { type: "multiAttack", params: [attackCount] },
        intervalSeconds,
        maxCount
      );

      // เก็บฟังก์ชันสำหรับหยุดการโจมตีอัตโนมัติ
      setAutoAttackStopFunctions((prev) => ({
        ...prev,
        [autoAttackId]: controller.stop,
      }));

      return {
        success: true,
        autoAttackId,
        stop: () => {
          const result = controller.stop();

          // ลบฟังก์ชันหยุดออกจาก state
          setAutoAttackStopFunctions((prev) => {
            const newState = { ...prev };
            delete newState[autoAttackId];
            return newState;
          });

          return result;
        },
      };
    } catch (error: any) {
      console.error("Error starting auto multi attack:", error);
      toast.error("เริ่มการโจมตีหลายครั้งอัตโนมัติไม่สำเร็จ", {
        description:
          error.message || "เกิดข้อผิดพลาดในการเริ่มการโจมตีหลายครั้งอัตโนมัติ",
      });
      return { success: false, error: error.message };
    }
  };

  // Auto Batch Attack
  const autoBatchAttack = async (
    monsterIds: number[],
    intervalSeconds: number,
    maxCount: number
  ) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีอัตโนมัติ",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    try {
      // Create Provider and Signer
      const { signer } = await getProviderAndSigner();

      // สร้าง ID สำหรับการโจมตีอัตโนมัตินี้
      const autoAttackId = `batch_attack_${monsterIds.length}_${Date.now()}`;

      // เริ่มการโจมตีอัตโนมัติ
      const controller = await autoTransactions(
        signer,
        { type: "batchAttack", params: [monsterIds] },
        intervalSeconds,
        maxCount
      );

      // เก็บฟังก์ชันสำหรับหยุดการโจมตีอัตโนมัติ
      setAutoAttackStopFunctions((prev) => ({
        ...prev,
        [autoAttackId]: controller.stop,
      }));

      return {
        success: true,
        autoAttackId,
        stop: () => {
          const result = controller.stop();

          // ลบฟังก์ชันหยุดออกจาก state
          setAutoAttackStopFunctions((prev) => {
            const newState = { ...prev };
            delete newState[autoAttackId];
            return newState;
          });

          return result;
        },
      };
    } catch (error: any) {
      console.error("Error starting auto batch attack:", error);
      toast.error("เริ่มการโจมตีหลายตัวอัตโนมัติไม่สำเร็จ", {
        description:
          error.message || "เกิดข้อผิดพลาดในการเริ่มการโจมตีหลายตัวอัตโนมัติ",
      });
      return { success: false, error: error.message };
    }
  };

  // Check connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (!hasMetaMask()) return;

      const wasConnected = localStorage.getItem("walletConnected") === "true";

      if (wasConnected && !isConnected) {
        try {
          connect();
        } catch (error) {
          console.error("Error checking connection:", error);
          localStorage.removeItem("walletConnected");
        }
      }
    };

    checkConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        address: localAddress,
        chainId: localChainId,
        isConnecting,
        isConnected: localIsConnected,
        connect,
        disconnect,
        switchNetwork,
        mintNFT,
        batchMintNFT,
        attackMonster,
        multiAttack,
        batchAttack,
        upgradeCharacter,
        batchUpgradeCharacters,
        changeArea,
        gainExperience,
        registerPlayer,
        isPlayerRegistered,
        batchTransactions: handleBatchTransactions,
        autoAttack,
        autoMultiAttack,
        autoBatchAttack,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
