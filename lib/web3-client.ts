"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import { ethers } from "ethers"
import { toast } from "sonner"

// สร้าง ABI สำหรับ NFT Contract
const NFT_ABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
]

// สร้าง Context สำหรับ Web3
interface Web3ContextType {
  address: string | null
  chainId: number | null
  isConnecting: boolean
  isConnected: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>
  mintNFT: (metadata: any) => Promise<any>
}

const Web3Context = createContext<Web3ContextType>({
  address: null,
  chainId: null,
  isConnecting: false,
  isConnected: false,
  connect: async () => {},
  disconnect: () => {},
  switchNetwork: async () => {},
  mintNFT: async () => ({}),
})

// ฟังก์ชันสำหรับใช้ Web3 Context
export const useWeb3 = () => useContext(Web3Context)

// ฟังก์ชันสำหรับตรวจสอบว่ามี MetaMask หรือไม่
const hasMetaMask = () => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// ฟังก์ชันสำหรับตรวจสอบว่าอยู่บนเครือข่ายที่รองรับหรือไม่
const isSupportedChain = (chainId: number) => {
  // รองรับ Ethereum Mainnet, Polygon, Mumbai Testnet, Sepolia Testnet
  return [1, 137, 80001, 11155111].includes(chainId)
}

// ฟังก์ชันสำหรับแปลง chainId เป็นชื่อเครือข่าย
export const getNetworkName = (chainId: number | null) => {
  if (!chainId) return "ไม่ทราบ"

  const networks: Record<number, string> = {
    1: "Ethereum Mainnet",
    137: "Polygon",
    80001: "Mumbai Testnet",
    11155111: "Sepolia Testnet",
  }

  return networks[chainId] || `เครือข่าย ${chainId}`
}

// Provider สำหรับ Web3
export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  // ฟังก์ชันสำหรับเชื่อมต่อกับ MetaMask
  const connect = async () => {
    if (!hasMetaMask()) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเชื่อมต่อกระเป๋าเงิน",
      })
      return
    }

    try {
      setIsConnecting(true)

      // ขอสิทธิ์เข้าถึงบัญชี
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send("eth_requestAccounts", [])

      if (accounts.length === 0) {
        throw new Error("ไม่พบบัญชี")
      }

      const network = await provider.getNetwork()
      const currentChainId = Number(network.chainId)

      setAddress(accounts[0])
      setChainId(currentChainId)
      setIsConnected(true)

      // บันทึกข้อมูลลงใน localStorage
      localStorage.setItem("walletConnected", "true")

      toast.success("เชื่อมต่อสำเร็จ", {
        description: `เชื่อมต่อกับกระเป๋าเงิน ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} บนเครือข่าย ${getNetworkName(currentChainId)}`,
      })
    } catch (error: any) {
      console.error("Error connecting to MetaMask:", error)
      toast.error("เชื่อมต่อไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเชื่อมต่อกับ MetaMask",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // ฟังก์ชันสำหรับตัดการเชื่อมต่อ
  const disconnect = () => {
    setAddress(null)
    setChainId(null)
    setIsConnected(false)
    localStorage.removeItem("walletConnected")

    toast.success("ตัดการเชื่อมต่อแล้ว", {
      description: "ตัดการเชื่อมต่อกับกระเป๋าเงินแล้ว",
    })
  }

  // ฟังก์ชันสำหรับเปลี่ยนเครือข่าย
  const switchNetwork = async (targetChainId: number) => {
    if (!hasMetaMask()) {
      toast.error("MetaMask ไม่พบ", {
        description: "กรุณาติดตั้ง MetaMask ก่อนเปลี่ยนเครือข่าย",
      })
      return
    }

    try {
      // เตรียมข้อมูลเครือข่าย
      const networkParams: Record<number, any> = {
        1: {
          chainId: "0x1", // Ethereum Mainnet
        },
        137: {
          chainId: "0x89", // Polygon
          chainName: "Polygon Mainnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://polygon-rpc.com/"],
          blockExplorerUrls: ["https://polygonscan.com/"],
        },
        80001: {
          chainId: "0x13881", // Mumbai Testnet
          chainName: "Mumbai Testnet",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC",
            decimals: 18,
          },
          rpcUrls: ["https://rpc-mumbai.maticvigil.com/"],
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        },
        11155111: {
          chainId: "0xaa36a7", // Sepolia Testnet
          chainName: "Sepolia Testnet",
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
          rpcUrls: ["https://rpc.sepolia.org/"],
          blockExplorerUrls: ["https://sepolia.etherscan.io/"],
        },
      }

      // แปลง chainId เป็น hex
      const chainIdHex = `0x${targetChainId.toString(16)}`

      try {
        // ลองเปลี่ยนเครือข่ายที่มีอยู่แล้ว
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError: any) {
        // เครือข่ายไม่มีอยู่ในกระเป๋าเงิน
        if (switchError.code === 4902) {
          // เพิ่มเครือข่ายใหม่
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [networkParams[targetChainId]],
          })
        } else {
          throw switchError
        }
      }

      // อัพเดต chainId
      setChainId(targetChainId)

      toast.success("เปลี่ยนเครือข่ายสำเร็จ", {
        description: `เปลี่ยนเครือข่ายเป็น ${getNetworkName(targetChainId)} แล้ว`,
      })
    } catch (error: any) {
      console.error("Error switching network:", error)
      toast.error("เปลี่ยนเครือข่ายไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการเปลี่ยนเครือข่าย",
      })
    }
  }

  // ฟังก์ชันสำหรับสร้าง NFT
  const mintNFT = async (metadata: any) => {
    if (!address || !chainId) {
      toast.error("ไม่ได้เชื่อมต่อ", {
        description: "กรุณาเชื่อมต่อกระเป๋าเงินก่อนสร้าง NFT",
      })
      return { success: false, error: "ไม่ได้เชื่อมต่อกระเป๋าเงิน" }
    }

    // ตรวจสอบว่ามี Contract Address หรือไม่
    const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
    if (!contractAddress) {
      // ถ้าไม่มี Contract Address จริง ให้จำลองการสร้าง NFT สำเร็จ
      // (ใช้สำหรับการทดสอบเท่านั้น)
      toast.success("สร้าง NFT สำเร็จ (โหมดจำลอง)", {
        description: `สร้าง NFT "${metadata.name}" สำเร็จแล้ว`,
      })

      return {
        success: true,
        tokenId: Math.floor(Math.random() * 1000000),
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
      }
    }

    try {
      // สร้าง Provider และ Signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()

      // สร้าง Contract instance
      const nftContract = new ethers.Contract(contractAddress, NFT_ABI, signer)

      // สร้าง metadata URI (ในระบบจริงควรอัพโหลดไปยัง IPFS)
      const tokenURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`

      // เรียกฟังก์ชัน mint
      const tx = await nftContract.mint(tokenURI)
      const receipt = await tx.wait()

      // ดึง tokenId จาก event (ตัวอย่างเท่านั้น อาจต้องปรับตาม Contract จริง)
      const tokenId = Number.parseInt(receipt.logs[0].topics[3], 16)

      toast.success("สร้าง NFT สำเร็จ", {
        description: `สร้าง NFT "${metadata.name}" สำเร็จแล้ว`,
      })

      return {
        success: true,
        tokenId,
        txHash: receipt.hash,
      }
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      toast.error("สร้าง NFT ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดในการสร้าง NFT",
      })

      return { success: false, error: error.message }
    }
  }

  // ตรวจสอบการเชื่อมต่อเมื่อโหลดหน้า
  useEffect(() => {
    const checkConnection = async () => {
      if (!hasMetaMask()) return

      const wasConnected = localStorage.getItem("walletConnected") === "true"

      if (wasConnected) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const accounts = await provider.listAccounts()

          if (accounts.length > 0) {
            const network = await provider.getNetwork()
            setAddress(accounts[0].address)
            setChainId(Number(network.chainId))
            setIsConnected(true)
          }
        } catch (error) {
          console.error("Error checking connection:", error)
          localStorage.removeItem("walletConnected")
        }
      }
    }

    checkConnection()
  }, [])

  // ติดตามการเปลี่ยนแปลงของบัญชีและเครือข่าย
  useEffect(() => {
    if (!hasMetaMask()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // ผู้ใช้ตัดการเชื่อมต่อจาก MetaMask
        disconnect()
      } else if (accounts[0] !== address) {
        // เปลี่ยนบัญชี
        setAddress(accounts[0])
        toast.success("เปลี่ยนบัญชี", {
          description: `เปลี่ยนบัญชีเป็น ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)} แล้ว`,
        })
      }
    }

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = Number.parseInt(chainIdHex, 16)
      setChainId(newChainId)
      toast.success("เปลี่ยนเครือข่าย", {
        description: `เปลี่ยนเครือข่ายเป็น ${getNetworkName(newChainId)} แล้ว`,
      })
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [address])

  return (
    <Web3Context.Provider
      value={{
        address,
        chainId,
        isConnecting,
        isConnected,
        connect,
        disconnect,
        switchNetwork,
        mintNFT,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

