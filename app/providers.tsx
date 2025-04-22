"use client";

import type React from "react";

import { I18nProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
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
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={true}
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider
            theme={{
              lightMode: lightTheme(),
              darkMode: darkTheme(),
            }}
            modalSize="compact"
            appInfo={{
              appName: "Adventure Clicker",
              disclaimer: () => (
                <div className="text-xs text-center p-2 mt-4">
                  By connecting your wallet, you agree to the terms of service
                  and privacy policy.
                </div>
              ),
            }}
          >
            <I18nProvider>
              {children}
              <Toaster richColors position="top-right" />
            </I18nProvider>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
