"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { ethers } from "ethers";
import { toast } from "sonner";
import { NFTContract } from "@/lib/nft-contract";

// ประเภทของ Web3 Context
interface Web3ContextType {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
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

// Chain IDs
const ETHEREUM_MAINNET = 1;
const POLYGON_MAINNET = 137;
const ARBITRUM_ONE = 42161;
const OPTIMISM = 10;
const BASE = 8453;
const SEPOLIA = 11155111;

// ข้อมูลเครือข่าย
const NETWORKS = {
  [ETHEREUM_MAINNET]: {
    name: "Ethereum",
    currency: "ETH",
    explorerUrl: "https://etherscan.io",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/",
  },
  [POLYGON_MAINNET]: {
    name: "Polygon",
    currency: "MATIC",
    explorerUrl: "https://polygonscan.com",
    rpcUrl: "https://polygon-mainnet.g.alchemy.com/v2/",
  },
  [ARBITRUM_ONE]: {
    name: "Arbitrum",
    currency: "ETH",
    explorerUrl: "https://arbiscan.io",
    rpcUrl: "https://arb-mainnet.g.alchemy.com/v2/",
  },
  [OPTIMISM]: {
    name: "Optimism",
    currency: "ETH",
    explorerUrl: "https://optimistic.etherscan.io",
    rpcUrl: "https://opt-mainnet.g.alchemy.com/v2/",
  },
  [BASE]: {
    name: "Base",
    currency: "ETH",
    explorerUrl: "https://basescan.org",
    rpcUrl: "https://base-mainnet.g.alchemy.com/v2/",
  },
  [SEPOLIA]: {
    name: "Sepolia",
    currency: "ETH",
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/",
  },
};

// ตรวจสอบว่ามี window.ethereum หรือไม่
const isMetaMaskInstalled = () => {
  return typeof window !== "undefined" && window.ethereum !== undefined;
};

// Provider Component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // เชื่อมต่อกับ MetaMask
  const connect = async () => {
    if (!isMetaMaskInstalled()) {
      toast.error("MetaMask ไม่ได้ติดตั้ง", {
        description: "กรุณาติดตั้ง MetaMask เพื่อใช้งานแอปพลิเคชัน",
        action: {
          label: "ติดตั้ง",
          onClick: () => window.open("https://metamask.io/download/", "_blank"),
        },
      });
      return;
    }

    setIsConnecting(true);

    try {
      // สร้าง provider
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      // ขอสิทธิ์เข้าถึงบัญชี
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      setAddress(account);

      // ดึง signer
      const ethersSigner = await ethersProvider.getSigner();
      setSigner(ethersSigner);

      // ดึง chain ID
      const network = await ethersProvider.getNetwork();
      setChainId(Number(network.chainId));

      setIsConnected(true);

      toast.success("เชื่อมต่อสำเร็จ", {
        description: `เชื่อมต่อกับกระเป๋า ${account.slice(
          0,
          6
        )}...${account.slice(-4)} แล้ว`,
      });
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      toast.error("เชื่อมต่อล้มเหลว", {
        description: "ไม่สามารถเชื่อมต่อกับ MetaMask ได้",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // ตัดการเชื่อมต่อ
  const disconnect = () => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setIsConnected(false);
    toast.info("ตัดการเชื่อมต่อแล้ว");
  };

  // เปลี่ยนเครือข่าย
  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return;

    const chainIdHex = `0x${targetChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainIdHex }],
      });
    } catch (error: any) {
      // เครือข่ายไม่ได้เพิ่มใน MetaMask
      if (error.code === 4902) {
        try {
          const network = NETWORKS[targetChainId];
          if (!network) throw new Error("ไม่รองรับเครือข่ายนี้");

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: chainIdHex,
                chainName: network.name,
                nativeCurrency: {
                  name: network.currency,
                  symbol: network.currency,
                  decimals: 18,
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorerUrl],
              },
            ],
          });
        } catch (addError) {
          console.error("Error adding network:", addError);
          toast.error("ไม่สามารถเพิ่มเครือข่ายได้");
        }
      } else {
        console.error("Error switching network:", error);
        toast.error("ไม่สามารถเปลี่ยนเครือข่ายได้");
      }
    }
  };

  // สร้าง NFT
  const mintNFT = async (tokenURI: string): Promise<string | null> => {
    if (!signer || !address) {
      toast.error("กรุณาเชื่อมต่อกระเป๋าก่อน");
      return null;
    }

    try {
      const nftContract = new ethers.Contract(
        process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "",
        NFTContract.abi,
        signer
      );

      const tx = await nftContract.mintNFT(address, tokenURI);
      const receipt = await tx.wait();

      // ค้นหา event ที่มีการ mint NFT
      const event = receipt.logs
        .map((log: any) => {
          try {
            return nftContract.interface.parseLog(log);
          } catch (e) {
            return null;
          }
        })
        .find((event: any) => event && event.name === "Transfer");

      if (event) {
        const tokenId = event.args.tokenId.toString();
        toast.success("สร้าง NFT สำเร็จ", {
          description: `Token ID: ${tokenId}`,
        });
        return tokenId;
      }

      return null;
    } catch (error) {
      console.error("Error minting NFT:", error);
      toast.error("ไม่สามารถสร้าง NFT ได้");
      return null;
    }
  };

  // ติดตามการเปลี่ยนแปลงของ MetaMask
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // ผู้ใช้ตัดการเชื่อมต่อจาก MetaMask
        disconnect();
      } else if (accounts[0] !== address) {
        // เปลี่ยนบัญชี
        setAddress(accounts[0]);
        toast.info("เปลี่ยนบัญชีแล้ว", {
          description: `เชื่อมต่อกับกระเป๋า ${accounts[0].slice(
            0,
            6
          )}...${accounts[0].slice(-4)} แล้ว`,
        });
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number.parseInt(chainIdHex, 16);
      setChainId(newChainId);

      // รีโหลดหน้าเมื่อเปลี่ยนเครือข่าย
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // ตรวจสอบว่าเชื่อมต่ออยู่แล้วหรือไม่
    if (isConnected && window.ethereum.selectedAddress) {
      setAddress(window.ethereum.selectedAddress);
    }

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [address, isConnected]);

  const value = {
    provider,
    signer,
    address,
    chainId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    switchNetwork,
    mintNFT,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
};
