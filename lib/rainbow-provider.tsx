"use client"

import type { ReactNode } from "react"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import { WagmiProvider, http } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "@rainbow-me/rainbowkit/styles.css"

// ตั้งค่า project ID สำหรับ WalletConnect
const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id"

// กำหนดค่า config ใหม่ด้วย getDefaultConfig API ของ RainbowKit v2
const config = getDefaultConfig({
  appName: "Adventure Clicker",
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(), 
    [arbitrum.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
  },
  // สามารถกำหนด wallet และค่า config อื่นๆ ของ wagmi ได้
})

// สร้าง query client สำหรับ TanStack Query (จำเป็นสำหรับ wagmi v2)
const queryClient = new QueryClient()

export function RainbowProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#7c3aed", // สีม่วง (Violet-600)
            accentColorForeground: "white",
            borderRadius: "medium",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

