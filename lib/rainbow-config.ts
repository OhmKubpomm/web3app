import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { mainnet, sepolia, base, optimism, arbitrum, zora } from "wagmi/chains";

// ตรวจสอบว่ามี Project ID หรือไม่
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

// ตรวจสอบว่ามี Alchemy API Key หรือไม่
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";

// กำหนดค่า chains ที่รองรับ
export const chains = [mainnet, sepolia, base, optimism, arbitrum, zora];

// สร้าง config สำหรับ RainbowKit และ wagmi
export const config = getDefaultConfig({
  appName: "Web3 Adventure Game",
  projectId: walletConnectProjectId,
  chains,
  transports: {
    // ใช้ http transport แทน providers แบบเดิม
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [zora.id]: http(),
  },
  // แก้ไขปัญหา chrome.runtime.sendMessage error
  walletConnectParameters: {
    projectId: walletConnectProjectId,
    showQrModal: true,
    qrModalOptions: {
      themeMode: "dark",
      explorerRecommendedWalletIds: [],
      enableExplorer: false,
    },
    metadata: {
      name: "Adventure Clicker",
      description: "Web3 Clicker Game",
      url: "https://adventure-clicker.vercel.app",
      icons: ["/images/ui/game-logo.png"],
    },
  },
});
