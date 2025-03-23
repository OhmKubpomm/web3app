"use client";

import type { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "@/components/theme-provider";
import { config } from "@/lib/rainbow-config";
import { Web3Provider } from "@/lib/web3-client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";

// สร้าง QueryClient สำหรับ React Query
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <I18nProvider>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: "#8b5cf6", // purple-500
              accentColorForeground: "white",
              borderRadius: "medium",
              fontStack: "system",
            })}
            modalSize="compact"
          >
            <Web3Provider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                <Toaster
                  position="top-right"
                  closeButton
                  richColors
                  toastOptions={{
                    style: {
                      background: "rgba(0,0,0,0.8)",
                      backdropFilter: "blur(10px)",
                    },
                  }}
                />
                {children}
              </ThemeProvider>
            </Web3Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </I18nProvider>
    </WagmiProvider>
  );
}
