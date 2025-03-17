import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Web3Provider } from "@/lib/web3-client";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Adventure Clicker - Web3 Game",
  description: "A blockchain-based adventure clicker game with NFT integration",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Web3Provider>
            <I18nProvider>
              {children}
              <Toaster richColors position="top-right" />
            </I18nProvider>
          </Web3Provider>
        </ThemeProvider>
      </body>
    </html>
  );
}
