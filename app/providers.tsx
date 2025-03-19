"use client";

import type { ReactNode } from "react";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { ThemeProvider } from "next-themes";
import { config } from "@/lib/rainbow-config";
import { Toaster } from "sonner";

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
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
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
