"use client";

import type React from "react";

import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Web3Provider } from "@/lib/web3-client";
import {
  RainbowKitProvider,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClientProvider } from "@tanstack/react-query";
import { config, queryClient } from "@/lib/rainbow-config";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme(),
            darkMode: darkTheme(),
          }}
          modalSize="compact"
        >
          <Web3Provider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem={true}
              disableTransitionOnChange
            >
              <I18nProvider>
                <Toaster richColors position="top-right" />
                {children}
              </I18nProvider>
            </ThemeProvider>
          </Web3Provider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}
