import "@rainbow-me/rainbowkit/styles.css"
import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { http } from "wagmi"
import { mainnet, sepolia, polygon, optimism, arbitrum, base } from "wagmi/chains"

export const config = getDefaultConfig({
  appName: "Adventure Clicker",
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  chains: [sepolia, mainnet, polygon, optimism, arbitrum, base],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
    [base.id]: http(),
  },
  ssr: true,
})

