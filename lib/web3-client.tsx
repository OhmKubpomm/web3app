"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork, useContractWrite } from "wagmi"
import { toast } from "sonner"
import { NFTContract } from "@/lib/contracts/nft-contract"
import { setCookie, deleteCookie } from "cookies-next"

// ประเภทของ Web3 Context
interface Web3ContextType {
  address: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  mintNFT: (tokenURI: string) => Promise<string | null>
}

// สร้าง Context
const Web3Context = createContext<Web3ContextType | null>(null)

// ฟังก์ชันสำหรับใช้งาน Context
export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Provider Component
export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const { address, isConnected, isConnecting } = useAccount()
  const { chain } = useNetwork()
  const { disconnect: wagmiDisconnect } = useDisconnect()
  const { switchNetworkAsync } = useSwitchNetwork()
  const [isInitialized, setIsInitialized] = useState(false)

  // เมื่อเชื่อมต่อหรือตัดการเชื่อมต่อ ให้อัปเดต cookie
  useEffect(() => {
    if (!isInitialized) return

    if (isConnected && address) {
      // บันทึก address ลงใน cookie เมื่อเชื่อมต่อ
      setCookie("player_address", address, { maxAge: 30 * 24 * 60 * 60 }) // 30 วัน
      toast.success("เชื่อมต่อสำเร็จ", {
        description: `เชื่อมต่อกับกระเป๋า ${address.slice(0, 6)}...${address.slice(-4)} แล้ว`,
        position: "top-right",
      })
    } else {
      // ลบ cookie เมื่อตัดการเชื่อมต่อ
      deleteCookie("player_address")
    }
  }, [isConnected, address, isInitialized])

  // ตั้งค่า isInitialized เป็น true หลังจาก mount
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // ฟังก์ชันตัดการเชื่อมต่อ
  const disconnect = () => {
    wagmiDisconnect()
    deleteCookie("player_address")
    toast.info("ตัดการเชื่อมต่อแล้ว", {
      position: "top-right",
    })
  }

  // ฟังก์ชันเปลี่ยนเครือข่าย
  const switchNetwork = async (chainId: number) => {
    if (!switchNetworkAsync) {
      toast.error("ไม่สามารถเปลี่ยนเครือข่ายได้", {
        description: "กรุณาเปลี่ยนเครือข่ายในกระเป๋าของคุณ",
        position: "top-right",
      })
      return
    }

    try {
      await switchNetworkAsync(chainId)
    } catch (error) {
      console.error("Error switching network:", error)
      toast.error("ไม่สามารถเปลี่ยนเครือข่ายได้", {
        position: "top-right",
      })
    }
  }

  // ฟังก์ชันสร้าง NFT
  const { write: writeNFT } = useContractWrite({
    address: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`,
    abi: NFTContract.abi,
    functionName: "mintNFT",
  })

  const mintNFT = async (tokenURI: string): Promise<string | null> => {
    if (!isConnected || !address) {
      toast.error("กรุณาเชื่อมต่อกระเป๋าก่อน", {
        position: "top-right",
      })
      return null
    }

    try {
      if (!process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS) {
        // ถ้าไม่มี Contract Address จริง ให้จำลองการสร้าง NFT สำเร็จ
        // (ใช้สำหรับการทดสอบเท่านั้น)
        toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)", {
          description: `สร้าง NFT สำเร็จแล้ว`,
          position: "top-right",
        })

        return Math.floor(Math.random() * 1000000).toString()
      }

      writeNFT({
        args: [address, tokenURI],
      })

      // หมายเหตุ: ในการใช้งานจริง คุณควรใช้ useWaitForTransaction เพื่อรอการยืนยันธุรกรรม
      // และดึง event จากธุรกรรมเพื่อรับ tokenId

      toast.success("ส่งคำขอสร้าง NFT แล้ว", {
        description: "กรุณารอการยืนยันธุรกรรม",
        position: "top-right",
      })

      // สำหรับตัวอย่างนี้ เราจะส่งค่า tokenId สุ่มกลับไป
      return Math.floor(Math.random() * 1000000).toString()
    } catch (error) {
      console.error("Error minting NFT:", error)
      toast.error("ไม่สามารถสร้าง NFT ได้", {
        position: "top-right",
      })
      return null
    }
  }

  const value = {
    address: address || null,
    chainId: chain?.id || null,
    isConnected,
    isConnecting,
    disconnect,
    switchNetwork,
    mintNFT,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

