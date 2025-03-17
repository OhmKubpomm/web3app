"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWeb3 } from "@/lib/web3-client"
import { toast } from "sonner"
import { useI18n } from "@/lib/i18n"
import { ExternalLink, Clock, CheckCircle, XCircle, ArrowUpRight, Wallet, Coins, RefreshCw } from "lucide-react"
import { formatAddress } from "@/lib/utils"
import { ethers } from "ethers"

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  status: "success" | "pending" | "failed"
}

export default function BlockchainExplorer() {
  const { address, chainId } = useWeb3()
  const { t } = useI18n()
  const [balance, setBalance] = useState<string>("0")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Get explorer URL based on chain ID
  const getExplorerUrl = (chainId: number | null) => {
    if (!chainId) return "https://etherscan.io"

    const explorers: Record<number, string> = {
      1: "https://etherscan.io",
      137: "https://polygonscan.com",
      80001: "https://mumbai.polygonscan.com",
      11155111: "https://sepolia.etherscan.io",
    }

    return explorers[chainId] || "https://etherscan.io"
  }

  // Get token symbol based on chain ID
  const getTokenSymbol = (chainId: number | null) => {
    if (!chainId) return "ETH"

    const tokens: Record<number, string> = {
      1: "ETH",
      137: "MATIC",
      80001: "MATIC",
      11155111: "ETH",
    }

    return tokens[chainId] || "ETH"
  }

  // Fetch balance and transactions
  const fetchBlockchainData = async () => {
    if (!address || typeof window === "undefined" || !window.ethereum) return

    setIsLoading(true)

    try {
      // Get balance
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balanceWei = await provider.getBalance(address)
      const balanceEth = ethers.formatEther(balanceWei)
      setBalance(Number.parseFloat(balanceEth).toFixed(4))

      // Mock transactions for demo
      // In a real app, you would fetch this from an API like Etherscan or Covalent
      const mockTransactions: Transaction[] = [
        {
          hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          from: address,
          to: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          value: "0.01",
          timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
          status: "success",
        },
        {
          hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          from: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          to: address,
          value: "0.05",
          timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
          status: "success",
        },
        {
          hash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          from: address,
          to: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          value: "0.002",
          timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
          status: "pending",
        },
      ]

      setTransactions(mockTransactions)
    } catch (error) {
      console.error("Error fetching blockchain data:", error)
      toast.error("เกิดข้อผิดพลาด", {
        description: "ไม่สามารถดึงข้อมูลบล็อกเชนได้",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data on mount and when address/chain changes
  useEffect(() => {
    if (address) {
      fetchBlockchainData()
    }
  }, [address, chainId])

  if (!address) {
    return (
      <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-6 text-center">
          <Wallet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-300">เชื่อมต่อกระเป๋าเงินของคุณเพื่อดูข้อมูลบล็อกเชน</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wallet className="h-5 w-5 text-purple-400" />
            <span>ข้อมูลบล็อกเชน</span>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-purple-500/30"
            onClick={fetchBlockchainData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">รีเฟรช</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 bg-black/60 rounded-lg p-1 mb-4">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              ภาพรวม
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-md"
            >
              ธุรกรรม
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-400">ที่อยู่กระเป๋าเงิน</h3>
                  <a
                    href={`${getExplorerUrl(chainId)}/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                  >
                    ดูบน Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-sm font-mono bg-black/30 p-2 rounded overflow-x-auto">{address}</p>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">ยอดคงเหลือ</h3>
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-yellow-400" />
                  <span className="text-xl font-bold">
                    {balance} {getTokenSymbol(chainId)}
                  </span>
                </div>
              </div>

              <div className="bg-black/30 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400 mb-2">เครือข่าย</h3>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">
                    {chainId === 1
                      ? "Ethereum Mainnet"
                      : chainId === 137
                        ? "Polygon Mainnet"
                        : chainId === 80001
                          ? "Mumbai Testnet"
                          : chainId === 11155111
                            ? "Sepolia Testnet"
                            : "เครือข่ายที่ไม่รู้จัก"}
                  </span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="mt-0">
            {transactions.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                <p className="text-gray-300">ไม่พบธุรกรรม</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.hash} className="bg-black/30 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {tx.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        ) : tx.status === "pending" ? (
                          <Clock className="h-4 w-4 text-yellow-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                        <span className="font-medium">
                          {tx.from.toLowerCase() === address.toLowerCase() ? "ส่ง" : "รับ"}
                        </span>
                      </div>
                      <Badge variant="outline" className="bg-black/30 text-gray-300 border-gray-700">
                        {new Date(tx.timestamp).toLocaleString()}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mb-2">
                      <span className="text-sm text-gray-400">
                        {tx.from.toLowerCase() === address.toLowerCase() ? "ถึง:" : "จาก:"}
                      </span>
                      <span className="text-sm font-mono">
                        {formatAddress(tx.from.toLowerCase() === address.toLowerCase() ? tx.to : tx.from)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Coins className="h-3.5 w-3.5 text-yellow-400" />
                        <span className="font-medium">
                          {tx.value} {getTokenSymbol(chainId)}
                        </span>
                      </div>

                      <a
                        href={`${getExplorerUrl(chainId)}/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
                      >
                        ดู <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

