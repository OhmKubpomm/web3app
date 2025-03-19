"use client"

import type { ReactNode } from "react"
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit"
import { argentWallet, trustWallet, ledgerWallet } from "@rainbow-me/rainbowkit/wallets"
import { configureChains, createConfig, WagmiConfig } from "wagmi"
import { mainnet, polygon, optimism, arbitrum, base, sepolia } from "wagmi/chains"
import { publicProvider } from "wagmi/providers/public"
import { alchemyProvider } from "wagmi/providers/alchemy"
import "@rainbow-me/rainbowkit/styles.css"

const { chains, publicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum, base, sepolia],
  [alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "" }), publicProvider()],
)

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id"

const { wallets } = getDefaultWallets({
  appName: "Adventure Clicker",
  projectId,
  chains,
})

const appInfo = {
  appName: "Adventure Clicker",
}

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: "Other Popular Wallets",
    wallets: [
      argentWallet({ projectId, chains }),
      trustWallet({ projectId, chains }),
      ledgerWallet({ projectId, chains }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
})

export function RainbowProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        appInfo={appInfo}
        theme={darkTheme({
          accentColor: "#7c3aed", // สีม่วง (Violet-600)
          accentColorForeground: "white",
          borderRadius: "medium",
          fontStack: "system",
        })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  )
}

