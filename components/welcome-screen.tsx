"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sword, Shield, Sparkles, Trophy, Scroll } from "lucide-react";
import Web3Status from "@/components/web3-status";
import { useWeb3 } from "@/lib/web3-client";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";

export default function WelcomeScreen() {
  const [activeTab, setActiveTab] = useState("features");
  const [isLoaded, setIsLoaded] = useState(false);
  const { isConnected } = useWeb3();
  const router = useRouter();
  const { t } = useI18n();

  // เมื่อโหลดเสร็จแล้ว ให้แสดงอนิเมชัน
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // เมื่อเชื่อมต่อกระเป๋าแล้ว ให้ redirect ไปหน้า dashboard
  useEffect(() => {
    if (isConnected) {
      router.push("/dashboard");
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* พื้นหลังแบบ Gradient ที่สวยงาม */}
      <div className="fixed inset-0 bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 py-20 min-h-screen flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-12"
        >
          <Image
            src="/placeholder.svg?height=120&width=120"
            alt="Game Logo"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            Web3 Adventure
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            {t("welcome.subtitle")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Web3Status />
            <Button variant="outline" onClick={() => setActiveTab("about")}>
              {t("welcome.learnMore")}
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-4xl"
        >
          <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm overflow-hidden">
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="features">
                    <Sword className="h-4 w-4 mr-2" />
                    {t("welcome.tabs.features")}
                  </TabsTrigger>
                  <TabsTrigger value="nfts">
                    <Trophy className="h-4 w-4 mr-2" />
                    {t("welcome.tabs.nfts")}
                  </TabsTrigger>
                  <TabsTrigger value="about">
                    <Scroll className="h-4 w-4 mr-2" />
                    {t("welcome.tabs.about")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                    {t("welcome.features.title")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <div className="bg-purple-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        <Sword className="h-6 w-6 text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("welcome.features.battle.title")}
                      </h3>
                      <p className="text-gray-400">
                        {t("welcome.features.battle.description")}
                      </p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <div className="bg-blue-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        <Shield className="h-6 w-6 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("welcome.features.characters.title")}
                      </h3>
                      <p className="text-gray-400">
                        {t("welcome.features.characters.description")}
                      </p>
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <div className="bg-yellow-900/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                        <Sparkles className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {t("welcome.features.upgrades.title")}
                      </h3>
                      <p className="text-gray-400">
                        {t("welcome.features.upgrades.description")}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="nfts" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                    {t("welcome.nfts.title")}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {t("welcome.nfts.description")}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <h3 className="text-lg font-semibold mb-2">
                        {t("welcome.nfts.collect.title")}
                      </h3>
                      <p className="text-gray-400 mb-4">
                        {t("welcome.nfts.collect.description")}
                      </p>
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="NFT Example"
                        width={200}
                        height={200}
                        className="mx-auto rounded-lg"
                      />
                    </div>

                    <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                      <h3 className="text-lg font-semibold mb-2">
                        {t("welcome.nfts.benefits.title")}
                      </h3>
                      <ul className="space-y-2 text-gray-400">
                        <li className="flex items-start">
                          <Trophy className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                          <span>{t("welcome.nfts.benefits.item1")}</span>
                        </li>
                        <li className="flex items-start">
                          <Trophy className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                          <span>{t("welcome.nfts.benefits.item2")}</span>
                        </li>
                        <li className="flex items-start">
                          <Trophy className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                          <span>{t("welcome.nfts.benefits.item3")}</span>
                        </li>
                        <li className="flex items-start">
                          <Trophy className="h-5 w-5 text-yellow-400 mr-2 mt-0.5" />
                          <span>{t("welcome.nfts.benefits.item4")}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="about" className="space-y-4">
                  <h2 className="text-2xl font-bold mb-4">
                    {t("welcome.about.title")}
                  </h2>
                  <p className="text-gray-300 mb-4">
                    {t("welcome.about.description1")}
                  </p>
                  <p className="text-gray-300 mb-6">
                    {t("welcome.about.description2")}
                  </p>

                  <div className="bg-black/30 p-4 rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-semibold mb-2">
                      {t("welcome.about.howToPlay.title")}
                    </h3>
                    <ol className="space-y-2 text-gray-400 list-decimal list-inside">
                      <li>{t("welcome.about.howToPlay.step1")}</li>
                      <li>{t("welcome.about.howToPlay.step2")}</li>
                      <li>{t("welcome.about.howToPlay.step3")}</li>
                      <li>{t("welcome.about.howToPlay.step4")}</li>
                    </ol>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
