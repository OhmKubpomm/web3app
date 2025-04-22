import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http, fallback } from "wagmi";
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  base,
  baseSepolia,
} from "wagmi/chains";
import { QueryClient } from "@tanstack/react-query";

// Make sure environment variables are present with fallbacks
const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "";
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY || "";
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const networkName = process.env.NEXT_PUBLIC_NETWORK || "sepolia";

// Log environment values for debugging (secure way)
console.log("WalletConnect Project ID configured:", !!walletConnectProjectId);
console.log("Alchemy API Key configured:", !!alchemyApiKey);
console.log("Infura API Key configured:", !!infuraApiKey);
console.log("Network configured:", networkName);

// ตรวจสอบว่ามี API key หรือไม่
if (!alchemyApiKey) {
  console.warn("Warning: Alchemy API Key is not configured. Using public RPC endpoints as fallback.");
}

if (!walletConnectProjectId) {
  console.warn("Warning: WalletConnect Project ID is not configured. This may affect wallet connection functionality.");
}

// Create transport configurations with fallbacks for reliability
const createChainTransport = (chainId: number) => {
  const transports = [];
  
  // Add Alchemy transport if API key is configured
  if (alchemyApiKey) {
    switch (chainId) {
      case mainnet.id:
        transports.push(http(`https://eth-mainnet.g.alchemy.com/v2/${alchemyApiKey}`));
        break;
      case sepolia.id:
        transports.push(http(`https://eth-sepolia.g.alchemy.com/v2/${alchemyApiKey}`));
        break;
      case polygon.id:
        transports.push(http(`https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`));
        break;
      case polygonMumbai.id:
        transports.push(http(`https://polygon-mumbai.g.alchemy.com/v2/${alchemyApiKey}`));
        break;
    }
  }
  
  // Add Infura transport if API key is configured 
  if (infuraApiKey) {
    switch (chainId) {
      case mainnet.id:
        transports.push(http(`https://mainnet.infura.io/v3/${infuraApiKey}`));
        break;
      case sepolia.id:
        transports.push(http(`https://sepolia.infura.io/v3/${infuraApiKey}`));
        break;
      case polygon.id:
        transports.push(http(`https://polygon-mainnet.infura.io/v3/${infuraApiKey}`));
        break;
      case polygonMumbai.id:
        transports.push(http(`https://polygon-mumbai.infura.io/v3/${infuraApiKey}`));
        break;
    }
  }
  
  // Always add public RPC endpoints as fallbacks
  switch (chainId) {
    case mainnet.id:
      transports.push(
        http('https://eth.llamarpc.com'),
        http('https://cloudflare-eth.com'),
        http('https://rpc.ankr.com/eth')
      );
      break;
    case sepolia.id:
      transports.push(
        http('https://rpc.sepolia.org'),
        http('https://rpc.ankr.com/eth_sepolia'),
        http('https://sepolia.gateway.tenderly.co')
      );
      break;
    case polygon.id:
      transports.push(
        http('https://polygon-rpc.com'),
        http('https://rpc.ankr.com/polygon'),
        http('https://polygon.llamarpc.com')
      );
      break;
    case polygonMumbai.id:
      transports.push(
        http('https://rpc-mumbai.maticvigil.com'),
        http('https://rpc.ankr.com/polygon_mumbai')
      );
      break;
    case base.id:
      transports.push(
        http('https://mainnet.base.org'),
        http('https://base.publicnode.com'),
        http('https://base-mainnet.public.blastapi.io')
      );
      break;
    case baseSepolia.id:
      transports.push(
        http('https://sepolia.base.org'),
        http('https://base-sepolia.public.blastapi.io')
      );
      break;
    default:
      return http();
  }
  
  // Return fallback transport with all configured providers
  return fallback(transports);
};

// Create config for RainbowKit and Wagmi with error handling
export const config = getDefaultConfig({
  appName: "Adventure Clicker",
  projectId: walletConnectProjectId,
  ssr: true,
  chains: [mainnet, sepolia, polygon, polygonMumbai, base, baseSepolia],
  transports: {
    [mainnet.id]: createChainTransport(mainnet.id),
    [sepolia.id]: createChainTransport(sepolia.id),
    [polygon.id]: createChainTransport(polygon.id),
    [polygonMumbai.id]: createChainTransport(polygonMumbai.id),
    [base.id]: createChainTransport(base.id),
    [baseSepolia.id]: createChainTransport(baseSepolia.id),
  },
});

// Create QueryClient with additional error handling and retry logic
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry(failureCount, error: any) {
        console.log("Query error:", error);
        
        // Retry on network errors or rate limiting
        if (error?.message?.includes('network') || 
            error?.message?.includes('timeout') ||
            error?.message?.includes('rate limit') ||
            error?.message?.includes('429')) {
          console.log(`Retrying query (attempt ${failureCount+1})...`);
          return failureCount < 5;
        }
        
        return false; // Don't retry other errors
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 30000, // 30 seconds
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});
