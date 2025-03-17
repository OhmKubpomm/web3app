"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sword, Shield, Sparkles, Coins, Scroll, Wallet, Gamepad2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3-client"
import { saveGameData } from "@/lib/actions"
import { toast } from "sonner"
import NetworkSwitcher from "@/components/network-switcher"
import LanguageSwitcher from "@/components/language-switcher"
import { useI18n } from "@/lib/i18n"

export default function WelcomeScreen() {
  const { address, isConnected, connect, isConnecting } = useWeb3()
  const { t } = useI18n()
  const [activeTab, setActiveTab] = useState("about")
  const [isLoading, setIsLoading] = useState(false)

  // ฟังก์ชันเชื่อมต่อกระเป๋าเงินและเริ่มเกม
  const handleStartGame = async () => {
    if (!address) {
      await connect()
      return
    }

    setIsLoading(true)

    try {
      // สร้างข้อมูลเกมเริ่มต้น
      const initialGameData = {
        coins: 0,
        damage: 1,
        autoDamage: 0,
        currentArea: "ป่า",
        walletAddress: address,
      }

      // บันทึกข้อมูลเกม
      const result = await saveGameData(address, initialGameData)

      if (result.success) {
        toast.success(t("common.success"), {
          description: t("common.loading"),
        })

        // รีโหลดหน้าเพื่อเริ่มเกม
        window.location.reload()
      } else {
        toast.error(t("common.error"), {
          description: result.error || t("common.error"),
        })
      }
    } catch (error) {
      console.error("Error starting game:", error)
      toast.error(t("common.error"), {
        description: t("common.error"),
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-900/20 via-black to-blue-900/20">
      <div className="flex-1 space-y-6 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400"
          >
            {t("welcome.title")}
          </motion.h1>
          <div className="flex gap-2">
            <LanguageSwitcher />
            <NetworkSwitcher />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          {/* ส่วนซ้าย: ภาพและปุ่มเริ่มเกม */}
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative h-80 mb-6 overflow-hidden rounded-xl border border-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50"></div>

              {/* Magic UI: แทนรูปภาพด้วย Animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* พื้นหลังเรืองแสง */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 3,
                    }}
                    className="absolute inset-0 rounded-full bg-purple-600/20 blur-xl"
                  />

                  {/* วงแหวนหมุน */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 20,
                      ease: "linear",
                    }}
                    className="absolute inset-0 border-2 border-purple-500/30 rounded-full"
                  />

                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 15,
                      ease: "linear",
                    }}
                    className="absolute inset-4 border-2 border-blue-500/30 rounded-full"
                  />

                  {/* ไอคอนตรงกลาง */}
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 3,
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-full shadow-lg shadow-purple-500/20">
                      <Gamepad2 className="h-16 w-16 text-white" />
                    </div>
                  </motion.div>

                  {/* อนุภาคลอย */}
                  {[...Array(10)].map((_, i) => {
                    const x = Math.random() * 300 - 150
                    return (
                      <motion.div
                        key={i}
                        initial={{
                          x: Math.random() * 200 - 100,
                          y: Math.random() * 200 - 100,
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{
                          x: Math.random() * 300 - 150,
                          y: Math.random() * 300 - 150,
                          opacity: [0, 1, 0],
                          scale: [0, 1, 0],
                        }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          duration: Math.random() * 5 + 3,
                          delay: Math.random() * 5,
                        }}
                        className="absolute w-2 h-2 rounded-full bg-purple-400/80"
                      />
                    )
                  })}
                </div>
              </div>
            </motion.div>

            <div className="flex flex-col items-center space-y-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-6 text-lg font-bold shadow-lg"
                  onClick={handleStartGame}
                  disabled={isConnecting || isLoading}
                >
                  {!address ? (
                    <>
                      <Wallet className="h-6 w-6 mr-2" />
                      {t("welcome.connect")}
                    </>
                  ) : (
                    <>
                      <Sword className="h-6 w-6 mr-2" />
                      {t("welcome.start")}
                    </>
                  )}
                </Button>
              </motion.div>

              {address && (
                <p className="text-sm text-gray-400">
                  {t("welcome.connect")}: {address.slice(0, 6)}...{address.slice(-4)}
                </p>
              )}
            </div>
          </div>

          {/* ส่วนขวา: แท็บข้อมูล */}
          <Card className="bg-black/40 backdrop-blur-sm border-purple-500/30">
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 bg-black/60 rounded-t-xl p-1">
                  <TabsTrigger
                    value="about"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
                  >
                    {t("welcome.about.title")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="features"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
                  >
                    {t("welcome.features.title")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="nft"
                    className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg"
                  >
                    NFT
                  </TabsTrigger>
                </TabsList>

                <div className="p-6">
                  <AnimatePresence mode="sync">
                    <TabsContent value="about" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Scroll className="h-5 w-5 text-purple-400" />
                          {t("welcome.about.title")}
                        </h2>

                        <p className="mb-4 text-gray-300">{t("welcome.about.description1")}</p>

                        <p className="mb-4 text-gray-300">{t("welcome.about.description2")}</p>

                        <p className="text-gray-300">{t("welcome.about.description3")}</p>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="features" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          {t("welcome.features.title")}
                        </h2>

                        <ul className="space-y-3">
                          <li className="flex items-start gap-2">
                            <Sword className="h-5 w-5 text-red-400 mt-0.5" />
                            <div>
                              <h3 className="font-bold">{t("welcome.features.combat.title")}</h3>
                              <p className="text-sm text-gray-400">{t("welcome.features.combat.description")}</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                            <div>
                              <h3 className="font-bold">{t("welcome.features.character.title")}</h3>
                              <p className="text-sm text-gray-400">{t("welcome.features.character.description")}</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Coins className="h-5 w-5 text-yellow-400 mt-0.5" />
                            <div>
                              <h3 className="font-bold">{t("welcome.features.economy.title")}</h3>
                              <p className="text-sm text-gray-400">{t("welcome.features.economy.description")}</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Sparkles className="h-5 w-5 text-purple-400 mt-0.5" />
                            <div>
                              <h3 className="font-bold">{t("welcome.features.quest.title")}</h3>
                              <p className="text-sm text-gray-400">{t("welcome.features.quest.description")}</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2">
                            <Wallet className="h-5 w-5 text-green-400 mt-0.5" />
                            <div>
                              <h3 className="font-bold">{t("welcome.features.web3.title")}</h3>
                              <p className="text-sm text-gray-400">{t("welcome.features.web3.description")}</p>
                            </div>
                          </li>
                        </ul>
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="nft" className="mt-0">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-purple-400" />
                          {t("welcome.nft.title")}
                        </h2>

                        <p className="mb-4 text-gray-300">{t("welcome.nft.description")}</p>

                        <div className="bg-black/30 p-4 rounded-lg mb-4">
                          <h3 className="font-bold mb-2">{t("welcome.nft.types.title")}</h3>
                          <ul className="space-y-2 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-400"></div>
                              <span>{t("welcome.nft.types.weapon")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                              <span>{t("welcome.nft.types.armor")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                              <span>{t("welcome.nft.types.accessory")}</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                              <span>{t("welcome.nft.types.special")}</span>
                            </li>
                          </ul>
                        </div>

                        <p className="text-gray-300">{t("welcome.nft.market")}</p>
                      </motion.div>
                    </TabsContent>
                  </AnimatePresence>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

