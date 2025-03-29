import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  base,
  baseSepolia,
} from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

// ตรวจสอบว่ามีค่า environment variables หรือไม่
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
const walletConnectProjectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";

// สร้าง config สำหรับ RainbowKit และ Wagmi
export const config = getDefaultConfig({
  appName: "Adventure Clicker",
  projectId: walletConnectProjectId,
  ssr: true, // เปิดใช้งาน SSR
  chains: [mainnet, sepolia, polygon, polygonMumbai, base, baseSepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(
      `https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`
    ),
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});

// สร้าง QueryClient สำหรับ React Query
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error) {
        if (error) return false;
        return failureCount < 3;
      },
    },
  },
});
