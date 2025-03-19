"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useAccount } from "wagmi"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n"
import LanguageSwitcher from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sword, Shield, Scroll, Coins, Gamepad2 } from "lucide-react"

export default function WelcomeScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  // Fix hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect to dashboard if connected
  useEffect(() => {
    if (mounted && isConnected) {
      router.push("/dashboard")
    }
  }, [mounted, isConnected, router])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* พื้นหลังแบบ Gradient ที่สวยงาม */}
      <div className="fixed inset-0 bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>
      <div className="fixed inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4">
        {/* Header with language and theme toggles */}
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-6"
            >
              <div className="relative inline-block">
                <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-8 rounded-full shadow-lg shadow-purple-500/20">
                  <Gamepad2 className="h-20 w-20 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="mb-2 text-4xl font-bold tracking-tight text-white md:text-6xl"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                {t("welcome.title")}
              </span>
            </motion.h1>
            <p className="text-lg text-gray-300">{t("welcome.subtitle")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Left Column - Game Info */}
            <Card className="border-purple-500/20 bg-black/60 backdrop-blur-sm">
              <CardContent className="p-6">
                <Tabs defaultValue="features">
                  <TabsList className="mb-4 grid w-full grid-cols-3">
                    <TabsTrigger value="features">{t("welcome.tabs.features")}</TabsTrigger>
                    <TabsTrigger value="gameplay">{t("welcome.tabs.gameplay")}</TabsTrigger>
                    <TabsTrigger value="rewards">{t("welcome.tabs.rewards")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="features" className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500/20">
                        <Sword className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{t("welcome.features.battle.title")}</h3>
                        <p className="text-sm text-gray-400">{t("welcome.features.battle.description")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{t("welcome.features.nft.title")}</h3>
                        <p className="text-sm text-gray-400">{t("welcome.features.nft.description")}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/20">
                        <Scroll className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{t("welcome.features.quests.title")}</h3>
                        <p className="text-sm text-gray-400">{t("welcome.features.quests.description")}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gameplay" className="space-y-4">
                    <p className="text-gray-300">{t("welcome.gameplay.description")}</p>
                    <ul className="ml-5 list-disc space-y-2 text-gray-300">
                      <li>{t("welcome.gameplay.point1")}</li>
                      <li>{t("welcome.gameplay.point2")}</li>
                      <li>{t("welcome.gameplay.point3")}</li>
                    </ul>
                  </TabsContent>

                  <TabsContent value="rewards" className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-500/20">
                        <Coins className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-white">{t("welcome.rewards.title")}</h3>
                        <p className="text-sm text-gray-400">{t("welcome.rewards.description")}</p>
                      </div>
                    </div>
                    <ul className="ml-5 list-disc space-y-2 text-gray-300">
                      <li>{t("welcome.rewards.point1")}</li>
                      <li>{t("welcome.rewards.point2")}</li>
                    </ul>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Right Column - Connect Wallet */}
            <Card className="border-purple-500/20 bg-black/60 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center gap-6 p-6">
                <div className="text-center">
                  <h2 className="mb-2 text-2xl font-bold text-white">{t("welcome.connect.title")}</h2>
                  <p className="text-gray-400">{t("welcome.connect.description")}</p>
                </div>

                {/* Rainbow Kit Connect Button */}
                <div className="w-full">
                  <ConnectButton.Custom>
                    {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                      const ready = mounted
                      const connected = ready && account && chain

                      return (
                        <div
                          {...(!ready && {
                            "aria-hidden": true,
                            style: {
                              opacity: 0,
                              pointerEvents: "none",
                              userSelect: "none",
                            },
                          })}
                          className="w-full"
                        >
                          {(() => {
                            if (!connected) {
                              return (
                                <Button
                                  onClick={openConnectModal}
                                  variant="default"
                                  size="lg"
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                  {t("welcome.connect.button")}
                                </Button>
                              )
                            }

                            if (chain.unsupported) {
                              return (
                                <Button onClick={openChainModal} variant="destructive" size="lg" className="w-full">
                                  {t("welcome.connect.wrongNetwork")}
                                </Button>
                              )
                            }

                            return (
                              <div className="flex w-full flex-col gap-3">
                                <Button
                                  onClick={openAccountModal}
                                  variant="outline"
                                  size="lg"
                                  className="w-full border-green-500/30 bg-green-950/20 text-green-400"
                                >
                                  {account.displayName}
                                </Button>

                                <Button
                                  onClick={() => router.push("/dashboard")}
                                  variant="default"
                                  size="lg"
                                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                                >
                                  {t("welcome.connect.enterGame")}
                                </Button>
                              </div>
                            )
                          })()}
                        </div>
                      )
                    }}
                  </ConnectButton.Custom>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">
                  <p>{t("welcome.connect.disclaimer")}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

