"use client";

import type React from "react";

import { useState, useEffect, createContext, useContext } from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { useAccount, useChainId, useDisconnect } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { GameContract } from "@/lib/contracts/game-contract";
import { NFTContract } from "@/lib/contracts/nft-contract";

// สร้าง Context สำหรับ Web3
interface Web3ContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  mintNFT: (metadata: any) => Promise<any>;
  attackMonster: (monsterId: number) => Promise<any>;
  multiAttack: (attackCount: number) => Promise<any>;
  upgradeCharacter: (characterId: number) => Promise<any>;
  changeArea: (newArea: string) => Promise<any>;
  gainExperience: (characterId: number, amount: number) => Promise<any>;
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
  attackMonster: async () => ({}),
  multiAttack: async () => ({}),
  upgradeCharacter: async () => ({}),
  changeArea: async () => ({}),
  gainExperience: async () => ({}),
});

// ฟังก์ชันสำหรับใช้ Web3 Context
export const useWeb3 = () => useContext(Web3Context);

// ฟังก์ชันสำหรับตรวจสอบว่ามี MetaMask หรือไม่
const hasMetaMask = () => {
  return (
    typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  );
};

// ฟังก์ชันสำหรับตรวจสอบว่าอยู่บนเครือข่ายที่รองรับหรือไม่
const isSupportedChain = (chainId: number) => {
  // รองรับ Ethereum Mainnet, Sepolia, Polygon, Mumbai Testnet, Base, Base Sepolia
  return [1, 11155111, 137, 80001, 8453, 84532].includes(chainId);
};

// ฟังก์ชันสำหรับแปลง chainId เป็นชื่อเครือข่าย
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
    10143: "Unknown Network",
  };

  return networks[chainId] || `เครือข่าย ${chainId}`;
};

// ฟังก์ชันสำหรับแปลงข้อความให้อยู่ในรูปแบบ Base64 ที่รองรับอักขระ UTF-8
const utf8ToBase64 = (str: string) => {
  if (typeof window !== "undefined") {
    // ใช้ TextEncoder สำหรับแปลง UTF-8 เป็น Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    // แปลง Uint8Array เป็นรูปแบบที่เหมาะสมกับ base64
    let base64 = "";
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      base64 += String.fromCharCode(bytes[i]);
    }
    return window.btoa(base64);
  }
  return btoa(str); // fallback สำหรับกรณีไม่ได้ทำงานบนเบราว์เซอร์
};

// Provider สำหรับ Web3
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnectAsync } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [isConnecting, setIsConnecting] = useState(false);
  const [localAddress, setLocalAddress] = useState<string | null>(null);
  const [localChainId, setLocalChainId] = useState<number | null>(null);
  const [localIsConnected, setLocalIsConnected] = useState(false);

  // อัพเดต state เมื่อ wagmi state เปลี่ยนแปลง
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

  // ฟังก์ชันสำหรับเชื่อมต่อกับ MetaMask
  const connect = async () => {
    if (!hasMetaMask() && !openConnectModal) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเชื่อมต่อกระเป๋าเงิน",
      });
      return;
    }

    try {
      setIsConnecting(true);

      if (openConnectModal) {
        openConnectModal();
      } else {
        // Fallback ถ้า RainbowKit ไม่ทำงาน
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

        // บันทึกข้อมูลลงใน localStorage
        localStorage.setItem("walletConnected", "true");

        toast.success("เชื่อมต่อสำเร็จ", {
          description: `เชื่อมต่อกับกระเป๋าเงิน ${accounts[0].slice(
            0,
            6
          )}...${accounts[0].slice(-4)} บนเครือข่าย ${getNetworkName(
            currentChainId
          )}`,
        });
      }
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("เชื่อมต่อไม่สำเร็จ", {
        description:
          error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ MetaMask",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // ฟังก์ชันสำหรับตัดการเชื่อมต่อ
  const disconnect = () => {
    if (disconnectAsync) {
      disconnectAsync();
    }

    setLocalAddress(null);
    setLocalChainId(null);
    setLocalIsConnected(false);
    localStorage.removeItem("walletConnected");

    toast.success("ตัดการเชื่อมต่อแล้ว", {
      description: "ตัดการเชื่อมต่อกับกระเป๋าเงินแล้ว",
    });
  };

  // ฟังก์ชันสำหรับเปลี่ยนเครือข่าย
  const switchNetwork = async (targetChainId: number) => {
    if (!hasMetaMask()) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเปลี่ยนเครือข่าย",
      });
      return;
    }

    try {
      // เตรียมข้อมูลเครือข่าย
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
      };

      // แปลง chainId เป็น hex
      const chainIdHex = `0x${targetChainId.toString(16)}`;

      try {
        // ลองเปลี่ยนเครือข่ายที่มีอยู่แล้ว
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        });
      } catch (switchError: any) {
        // เครือข่ายไม่มีอยู่ในกระเป๋าเงิน
        if (switchError.code === 4902) {
          // เพิ่มเครือข่ายใหม่
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[targetChainId]],
          });
        } else {
          throw switchError;
        }
      }

      // อัพเดต chainId
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

  // ฟังก์ชันเพิ่มประสบการณ์ให้ตัวละคร
  const gainExperience = async (characterId: number, amount: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนเพิ่มประสบการณ์",
      });
      return null;
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = GameContract.address;
    if (!contractAddress) {
      // จำลองการเพิ่มประสบการณ์สำเร็จ (ใช้สำหรับการทดสอบเท่านั้น)
      return {
        success: true,
        xpGained: amount,
        newLevel: amount > 100 ? true : false,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const gameContract = new ethers.Contract(
        contractAddress,
        GameContract.abi,
        signer
      );

      // เรียกฟังก์ชัน gainExperience
      const tx = await gameContract.gainExperience(characterId, amount);
      const receipt = await tx.wait();

      // ดึงข้อมูลจาก event หรือ return value
      const result = {
        success: true,
        xpGained: amount,
        newLevel: false,
      };

      // ตรวจสอบ event ที่เกิดขึ้น
      for (const log of receipt.logs) {
        try {
          const parsedLog = gameContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "ExperienceGained") {
            result.xpGained = Number(parsedLog.args.amount);
          } else if (parsedLog && parsedLog.name === "LevelUp") {
            result.newLevel = true;
          }
        } catch (e) {
          // ข้าม log ที่ไม่สามารถ parse ได้
        }
      }

      return result;
    } catch (error: any) {
      console.error("Error gaining experience:", error);
      toast.error("เพิ่มประสบการณ์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเพิ่มประสบการณ์",
      });
      return null;
    }
  };

  // ฟังก์ชันสำหรับสร้าง NFT
  const mintNFT = async (metadata: any) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนสร้าง NFT",
      });
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" };
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = NFTContract.address;
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการสร้าง NFT สำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)", {
        description: `สร้าง NFT "${metadata.name}" สำเร็จแล้ว`,
      });

      return {
        success: true,
        tokenId: Math.floor(Math.random() * 1000000),
        txHash: `0x${Array.from({ length: 64 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join("")}`,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const nftContract = new ethers.Contract(
        contractAddress,
        NFTContract.abi,
        signer
      );

      // สร้าง metadata URI (ในระบบจริงควรอัพโหลดไปยัง IPFS)
      // ใช้ utf8ToBase64 แทน btoa เพื่อรองรับอักขระ UTF-8
      const tokenURI = `data:application/json;base64,${utf8ToBase64(
        JSON.stringify(metadata)
      )}`;

      // เรียกฟังก์ชัน mint
      const tx = await nftContract.mintNFT(localAddress, tokenURI);
      const receipt = await tx.wait();

      // ดึง tokenId จาก event
      let tokenId = 0;
      for (const log of receipt.logs) {
        try {
          const parsedLog = nftContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "Transfer") {
            tokenId = Number(parsedLog.args.tokenId);
            break;
          }
        } catch (e) {
          // ข้าม log ที่ไม่สามารถ parse ได้
        }
      }

      toast.success("สร้าง NFT สำเร็จ", {
        description: `สร้าง NFT "${metadata.name}" สำเร็จแล้ว`,
      });

      return {
        success: true,
        tokenId,
        txHash: receipt.hash,
      };
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      toast.error("สร้าง NFT ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการสร้าง NFT",
      });

      return { success: false, error: error.message };
    }
  };

  // ฟังก์ชันสำหรับโจมตีมอนสเตอร์
  const attackMonster = async (monsterId: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีมอนสเตอร์",
      });
      return null;
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = GameContract.address;
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการโจมตีสำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      return {
        damage: 5,
        defeated: Math.random() > 0.7,
        reward: Math.floor(Math.random() * 10) + 1,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const gameContract = new ethers.Contract(
        contractAddress,
        GameContract.abi,
        signer
      );

      // เรียกฟังก์ชัน attack
      const tx = await gameContract.attack(monsterId);
      const receipt = await tx.wait();

      // ดึงข้อมูลจาก event หรือ return value
      const result = {
        damage: 5, // ค่าเริ่มต้น
        defeated: false,
        reward: 0,
      };

      // ตรวจสอบ event ที่เกิดขึ้น
      for (const log of receipt.logs) {
        try {
          const parsedLog = gameContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "AttackPerformed") {
            result.damage = Number(parsedLog.args.damage);
            result.defeated = parsedLog.args.defeated;
          } else if (parsedLog && parsedLog.name === "MonsterDefeated") {
            result.defeated = true;
            result.reward = Number(parsedLog.args.reward);
          }
        } catch (e) {
          // ข้าม log ที่ไม่สามารถ parse ได้
        }
      }

      return result;
    } catch (error: any) {
      console.error("Error attacking monster:", error);
      toast.error("โจมตีมอนสเตอร์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการโจมตีมอนสเตอร์",
      });
      return null;
    }
  };

  // ฟังก์ชันสำหรับโจมตีหลายครั้ง
  const multiAttack = async (attackCount: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนโจมตีมอนสเตอร์",
      });
      return null;
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = GameContract.address;
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการโจมตีสำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      return {
        totalDamage: 5 * attackCount,
        monstersDefeated: Math.floor(Math.random() * attackCount) + 1,
        totalReward: (Math.floor(Math.random() * 10) + 1) * attackCount,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const gameContract = new ethers.Contract(
        contractAddress,
        GameContract.abi,
        signer
      );

      // เรียกฟังก์ชัน multiAttack
      const tx = await gameContract.multiAttack(attackCount);
      const receipt = await tx.wait();

      // ดึงข้อมูลจาก event หรือ return value
      const result = {
        totalDamage: 0,
        monstersDefeated: 0,
        totalReward: 0,
      };

      // ตรวจสอบ event ที่เกิดขึ้น
      for (const log of receipt.logs) {
        try {
          const parsedLog = gameContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "MultiAttackPerformed") {
            result.totalDamage = Number(parsedLog.args.totalDamage);
            result.monstersDefeated = Number(parsedLog.args.monstersDefeated);
          } else if (parsedLog && parsedLog.name === "MonsterDefeated") {
            result.totalReward += Number(parsedLog.args.reward);
          }
        } catch (e) {
          // ข้าม log ที่ไม่สามารถ parse ได้
        }
      }

      return result;
    } catch (error: any) {
      console.error("Error multi-attacking:", error);
      toast.error("โจมตีมอนสเตอร์ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการโจมตีมอนสเตอร์",
      });
      return null;
    }
  };

  // ฟังก์ชันสำหรับอัพเกรดตัวละคร
  const upgradeCharacter = async (characterId: number) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนอัพเกรดตัวละคร",
      });
      return null;
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = GameContract.address;
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการอัพเกรดสำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      return {
        newLevel: Math.floor(Math.random() * 5) + 2,
        cost: Math.floor(Math.random() * 100) + 50,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const gameContract = new ethers.Contract(
        contractAddress,
        GameContract.abi,
        signer
      );

      // เรียกฟังก์ชัน upgradeCharacter
      const tx = await gameContract.upgradeCharacter(characterId);
      const receipt = await tx.wait();

      // ดึงข้อมูลจาก event หรือ return value
      const result = {
        newLevel: 0,
        cost: 0,
      };

      // ตรวจสอบ event ที่เกิดขึ้น
      for (const log of receipt.logs) {
        try {
          const parsedLog = gameContract.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "CharacterUpgraded") {
            result.newLevel = Number(parsedLog.args.newLevel);
            result.cost = Number(parsedLog.args.cost);
          }
        } catch (e) {
          // ข้าม log ที่ไม่สามารถ parse ได้
        }
      }

      return result;
    } catch (error: any) {
      console.error("Error upgrading character:", error);
      toast.error("อัพเกรดตัวละครไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการอัพเกรดตัวละคร",
      });
      return null;
    }
  };

  // ฟังก์ชันสำหรับเปลี่ยนพื้นที่
  const changeArea = async (newArea: string) => {
    if (!localAddress || !localChainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนเปลี่ยนพื้นที่",
      });
      return null;
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = GameContract.address;
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการเปลี่ยนพื้นที่สำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      return {
        success: true,
      };
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // หลีกเลี่ยงการใช้ ENS ในเครือข่ายที่ไม่รองรับ
      provider.getResolver = async (name: string) => {
        return null;
      };

      // สร้าง Contract instance
      const gameContract = new ethers.Contract(
        contractAddress,
        GameContract.abi,
        signer
      );

      // เรียกฟังก์ชัน changeArea
      const tx = await gameContract.changeArea(newArea);
      const receipt = await tx.wait();

      return {
        success: true,
      };
    } catch (error: any) {
      console.error("Error changing area:", error);
      toast.error("เปลี่ยนพื้นที่ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนพื้นที่",
      });
      return null;
    }
  };

  // ตรวจสอบการเชื่อมต่อเมื่อโหลดหน้า
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
        attackMonster,
        multiAttack,
        upgradeCharacter,
        changeArea,
        gainExperience,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}
