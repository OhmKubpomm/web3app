"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Coins,
  AlertCircle,
  RefreshCw,
  Trash2,
  Info,
  ExternalLink,
} from "lucide-react";
import { useWeb3 } from "@/lib/web3-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { mintNFT } from "@/lib/nft-client";
import { ethers } from "ethers";

interface NFTPanelProps {
  gameData: any;
  onMintNFT: (item: any) => void;
  isProcessing: boolean;
}

export default function NFTPanel({
  gameData,
  onMintNFT,
  isProcessing,
}: NFTPanelProps) {
  const { address, chainId } = useWeb3();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [mintingStatus, setMintingStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [mintedNFTs, setMintedNFTs] = useState<any[]>([]);
  const [showInventoryFull, setShowInventoryFull] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [nftToDelete, setNftToDelete] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [inventoryLimit] = useState(6); // กำหนดจำนวน NFT สูงสุดที่สามารถมีได้
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [mintProgress, setMintProgress] = useState(0);
  const [txHash, setTxHash] = useState<string | null>(null);

  // โหลดข้อมูล NFT ที่เคย mint ไว้แล้วจาก localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && address) {
      try {
        const savedNFTs = localStorage.getItem(`mintedNFTs_${address}`);
        if (savedNFTs) {
          const parsedNFTs = JSON.parse(savedNFTs);
          if (Array.isArray(parsedNFTs)) {
            setMintedNFTs(parsedNFTs);
            console.log(`Loaded ${parsedNFTs.length} NFTs from storage`);
          } else {
            console.warn("Saved NFTs is not an array, resetting");
            localStorage.setItem(`mintedNFTs_${address}`, JSON.stringify([]));
            setMintedNFTs([]);
          }
        } else {
          console.log("No saved NFTs found, initializing empty array");
          localStorage.setItem(`mintedNFTs_${address}`, JSON.stringify([]));
          setMintedNFTs([]);
        }
      } catch (e) {
        console.error("Error parsing saved NFTs:", e);
        localStorage.removeItem(`mintedNFTs_${address}`);
        localStorage.setItem(`mintedNFTs_${address}`, JSON.stringify([]));
        setMintedNFTs([]);
      }
    }
  }, [address]);

  // บันทึกข้อมูล NFT ที่ mint แล้วลงใน localStorage
  const saveNFTToStorage = (nft: any) => {
    if (typeof window !== "undefined" && address) {
      try {
        // ดึงข้อมูลปัจจุบันก่อน
        const savedNFTs = localStorage.getItem(`mintedNFTs_${address}`);
        let currentNFTs = [];

        if (savedNFTs) {
          try {
            currentNFTs = JSON.parse(savedNFTs);
            if (!Array.isArray(currentNFTs)) {
              console.warn("Current NFTs is not an array, resetting");
              currentNFTs = [];
            }
          } catch (e) {
            console.error("Error parsing NFTs in saveNFTToStorage:", e);
            currentNFTs = [];
          }
        }

        // เพิ่ม NFT ใหม่
        const updatedNFTs = [...currentNFTs, nft];

        // บันทึกกลับไปที่ localStorage
        localStorage.setItem(
          `mintedNFTs_${address}`,
          JSON.stringify(updatedNFTs)
        );

        // อัพเดท state
        setMintedNFTs(updatedNFTs);

        console.log("NFT saved successfully:", nft);
        console.log("Total NFTs:", updatedNFTs.length);
      } catch (e) {
        console.error("Error saving NFT to storage:", e);
        toast.error("ไม่สามารถบันทึกข้อมูล NFT ได้", {
          description: "เกิดข้อผิดพลาดในการบันทึกข้อมูล NFT",
        });
      }
    }
  };

  // ลบ NFT ออกจาก localStorage
  const removeNFTFromStorage = (tokenId: number) => {
    if (typeof window !== "undefined" && address) {
      try {
        // ดึงข้อมูลปัจจุบันก่อน
        const savedNFTs = localStorage.getItem(`mintedNFTs_${address}`);
        let currentNFTs = [];

        if (savedNFTs) {
          try {
            currentNFTs = JSON.parse(savedNFTs);
            if (!Array.isArray(currentNFTs)) {
              console.warn("Current NFTs is not an array, resetting");
              currentNFTs = [];
            }
          } catch (e) {
            console.error("Error parsing NFTs in removeNFTFromStorage:", e);
            currentNFTs = [];
          }
        }

        // กรอง NFT ที่ต้องการลบออก
        const updatedNFTs = currentNFTs.filter(
          (nft) => nft.tokenId !== tokenId
        );

        // บันทึกกลับไปที่ localStorage
        localStorage.setItem(
          `mintedNFTs_${address}`,
          JSON.stringify(updatedNFTs)
        );

        // อัพเดท state
        setMintedNFTs(updatedNFTs);

        console.log("NFT removed successfully. TokenId:", tokenId);
        console.log("Remaining NFTs:", updatedNFTs.length);

        return true;
      } catch (e) {
        console.error("Error removing NFT from storage:", e);
        toast.error("ไม่สามารถลบข้อมูล NFT ได้", {
          description: "เกิดข้อผิดพลาดในการลบข้อมูล NFT",
        });
        return false;
      }
    }
    return false;
  };

  // ตรวจสอบว่า NFT เต็มหรือไม่
  useEffect(() => {
    console.log(`Checking inventory: ${mintedNFTs.length}/${inventoryLimit}`);
    if (mintedNFTs.length >= inventoryLimit) {
      setShowInventoryFull(true);
    } else {
      setShowInventoryFull(false);
    }
  }, [mintedNFTs, inventoryLimit]);

  // ฟังก์ชันรีเฟรชข้อมูล NFT
  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);

    try {
      // จำลองการโหลดข้อมูลจาก blockchain
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // โหลดข้อมูลจาก localStorage อีกครั้ง
      if (typeof window !== "undefined" && address) {
        const savedNFTs = localStorage.getItem(`mintedNFTs_${address}`);
        if (savedNFTs) {
          try {
            const parsedNFTs = JSON.parse(savedNFTs);
            if (Array.isArray(parsedNFTs)) {
              setMintedNFTs(parsedNFTs);
            }
          } catch (e) {
            console.error("Error parsing saved NFTs during refresh:", e);
          }
        }
      }

      toast.success("รีเฟรชข้อมูล NFT สำเร็จ", {
        description: "ข้อมูล NFT ได้รับการอัพเดทแล้ว",
      });
    } catch (error) {
      toast.error("รีเฟรชข้อมูลไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาดในการรีเฟรชข้อมูล NFT",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // ฟังก์ชันเริ่มกระบวนการลบ NFT
  const handleDeleteStart = (nft: any) => {
    setNftToDelete(nft);
    setShowDeleteDialog(true);
  };

  // ฟังก์ชันยืนยันการลบ NFT
  const handleConfirmDelete = () => {
    if (!nftToDelete) return;

    try {
      // ลบ NFT ออกจาก localStorage
      const success = removeNFTFromStorage(nftToDelete.tokenId);

      if (success) {
        toast.success("ขาย NFT สำเร็จ", {
          description: `ขาย ${nftToDelete.name} สำเร็จแล้ว`,
        });

        // ปิด dialog
        setShowDeleteDialog(false);
        setNftToDelete(null);
      } else {
        throw new Error("ไม่สามารถลบ NFT ได้");
      }
    } catch (error) {
      toast.error("ขาย NFT ไม่สำเร็จ", {
        description: "เกิดข้อผิดพลาดในการขาย NFT",
      });
    }
  };

  // ฟังก์ชันดู NFT บน Block Explorer
  const viewNFTOnExplorer = (tokenId: number) => {
    if (!tokenId) return;

    let explorerUrl = "";
    if (chainId === 10143) {
      explorerUrl = `https://testnet.monadexplorer.com/token/${process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}/${tokenId}`;
    } else {
      explorerUrl = `https://sepolia.etherscan.io/token/${process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}?a=${tokenId}`;
    }

    window.open(explorerUrl, "_blank");
  };

  // สร้างไอเทม NFT สำหรับซื้อ
  const nftItems = [
    {
      name: "ดาบนักรบ",
      description: "เพิ่มพลังโจมตี 10%",
      type: "weapon",
      rarity: "uncommon",
      image: "/placeholder.svg?height=80&width=80",
      cost: 200,
    },
    {
      name: "โล่มังกร",
      description: "เพิ่มความทนทาน 15%",
      type: "shield",
      rarity: "rare",
      image: "/placeholder.svg?height=80&width=80",
      cost: 500,
    },
    {
      name: "เกราะเวทย์",
      description: "เพิ่มพลังเวทย์ 20%",
      type: "armor",
      rarity: "epic",
      image: "/placeholder.svg?height=80&width=80",
      cost: 800,
    },
  ];

  // ฟังก์ชันเริ่มกระบวนการ mint NFT
  const handleMintStart = (item: any) => {
    console.log(`Current NFT count: ${mintedNFTs.length}/${inventoryLimit}`);
    if (mintedNFTs.length >= inventoryLimit) {
      toast.error("กระเป๋า NFT เต็ม", {
        description: "คุณไม่สามารถ mint NFT เพิ่มได้ กรุณาขาย NFT บางชิ้นก่อน",
      });
      return;
    }

    setSelectedItem(item);
    setShowConfirmDialog(true);
    setErrorMessage(null);
    setMintProgress(0);
    setTxHash(null);
  };

  // ฟังก์ชันยืนยันการ mint NFT
  const handleConfirmMint = async () => {
    if (!selectedItem || !address) return;

    // ตรวจสอบอีกครั้งว่า NFT ไม่เต็ม
    if (mintedNFTs.length >= inventoryLimit) {
      toast.error("กระเป๋า NFT เต็ม", {
        description: "คุณไม่สามารถ mint NFT เพิ่มได้ กรุณาขาย NFT บางชิ้นก่อน",
      });
      setShowConfirmDialog(false);
      return;
    }

    setMintingStatus("processing");
    setErrorMessage(null);

    // เริ่มการอัพเดทความคืบหน้า
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress > 90) {
        progress = 90; // ไม่ให้เต็ม 100% จนกว่าจะสำเร็จจริงๆ
      }
      setMintProgress(progress);
    }, 500);

    try {
      // สร้าง metadata สำหรับ NFT
      const metadata = {
        name: selectedItem.name,
        description: selectedItem.description,
        image: selectedItem.image,
        attributes: [
          { trait_type: "Type", value: selectedItem.type },
          { trait_type: "Rarity", value: selectedItem.rarity },
          { trait_type: "Boost", value: selectedItem.description },
        ],
      };

      console.log("Attempting to mint NFT with metadata:", metadata);

      // Get provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // เรียกใช้ฟังก์ชัน mintNFT จาก nft-client
      const result: {
        success: boolean;
        tokenId?: number;
        txHash?: string;
        error?: string;
      } = await mintNFT(signer, address, metadata);
      console.log("Mint result:", result);

      // Set transaction hash
      if (result.txHash) {
        setTxHash(result.txHash);
      }

      // หยุดการอัพเดทความคืบหน้า
      clearInterval(progressInterval);
      setMintProgress(100);

      if (result.success) {
        // บันทึกข้อมูล NFT ที่ mint แล้ว
        const mintedNFT = {
          ...selectedItem,
          tokenId: result.tokenId,
          txHash: result.txHash,
          mintedAt: new Date().toISOString(),
          simulated: false,
        };

        saveNFTToStorage(mintedNFT);

        // อัพเดทข้อมูลเกม
        onMintNFT({
          ...gameData,
          coins: gameData.coins - selectedItem.cost,
          nfts: [...(gameData.nfts || []), mintedNFT],
        });

        setMintingStatus("success");

        // ปิด dialog หลังจาก mint สำเร็จ
        setTimeout(() => {
          setShowConfirmDialog(false);
          setMintingStatus("idle");
          setSelectedItem(null);
          setTxHash(null);
        }, 2000);
      } else {
        // หยุดการอัพเดทความคืบหน้า
        clearInterval(progressInterval);
        setMintProgress(0);

        setMintingStatus("error");
        setErrorMessage(result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
        toast.error("Mint NFT ไม่สำเร็จ", {
          description: result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
        });
      }
    } catch (error: any) {
      // หยุดการอัพเดทความคืบหน้า
      clearInterval(progressInterval);
      setMintProgress(0);

      console.error("Error minting NFT:", error);
      setMintingStatus("error");
      setErrorMessage(error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      toast.error("Mint NFT ไม่สำเร็จ", {
        description: error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
      });
    }
  };

  // ฟังก์ชันลองใหม่
  const handleRetry = () => {
    setMintingStatus("idle");
    setErrorMessage(null);
    setMintProgress(0);
    setTxHash(null);
  };

  return (
    <>
      <Card className="bg-black/40 border-purple-500/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              NFT พิเศษ
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${
                  mintedNFTs.length >= inventoryLimit
                    ? "text-red-400"
                    : "text-gray-400"
                }`}
              >
                {mintedNFTs.length}/{inventoryLimit}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                <span className="sr-only">รีเฟรช</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {showInventoryFull && (
            <Alert
              variant="destructive"
              className="bg-red-900/20 border border-red-500/30 text-red-100 mb-3"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <AlertTitle>กระเป๋า NFT เต็ม</AlertTitle>
              <AlertDescription>
                คุณไม่สามารถ mint NFT เพิ่มได้ กรุณาขาย NFT บางชิ้นก่อน
              </AlertDescription>
            </Alert>
          )}

          {/* แสดง NFT ที่มีอยู่แล้ว */}
          {mintedNFTs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">NFT ของคุณ</h4>
              <div className="grid grid-cols-2 gap-2">
                {mintedNFTs.map((nft, index) => (
                  <Card
                    key={index}
                    className="bg-black/30 border-purple-500/30 hover:border-purple-500/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Badge
                            className={`absolute -top-2 -right-2 ${
                              nft.rarity === "common"
                                ? "bg-gray-500"
                                : nft.rarity === "uncommon"
                                ? "bg-green-500"
                                : nft.rarity === "rare"
                                ? "bg-blue-500"
                                : "bg-purple-500"
                            }`}
                          >
                            {nft.rarity}
                          </Badge>
                          <div className="w-10 h-10 bg-purple-900/30 rounded-md flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-purple-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h5 className="text-xs font-medium">{nft.name}</h5>
                          <div className="flex items-center gap-1">
                            <p className="text-xs text-gray-400">
                              #{nft.tokenId}
                            </p>
                            {nft.simulated && (
                              <Badge
                                variant="outline"
                                className="h-4 text-[8px] px-1 border-yellow-500 text-yellow-500"
                              >
                                จำลอง
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                            onClick={() => viewNFTOnExplorer(nft.tokenId)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">ดู</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={() => handleDeleteStart(nft)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">ขาย</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-800 pt-3">
            <h4 className="text-sm font-medium mb-2">NFT ที่สามารถซื้อได้</h4>
          </div>

          {nftItems.map((item, index) => (
            <motion.div key={index} whileHover={{ scale: 1.02 }}>
              <Card className="bg-black/30 border-purple-500/30 hover:border-purple-500/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Badge
                        className={`absolute -top-2 -right-2 ${
                          item.rarity === "common"
                            ? "bg-gray-500"
                            : item.rarity === "uncommon"
                            ? "bg-green-500"
                            : item.rarity === "rare"
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }`}
                      >
                        {item.rarity}
                      </Badge>
                      <div className="w-12 h-12 bg-purple-900/30 rounded-md flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-xs text-gray-400">
                        {item.description}
                      </p>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1 border-purple-500/50 hover:bg-purple-500/20"
                        disabled={
                          gameData.coins < item.cost ||
                          isProcessing ||
                          mintedNFTs.length >= inventoryLimit
                        }
                        onClick={() => handleMintStart(item)}
                      >
                        <Coins className="h-3 w-3 text-yellow-400" />
                        <span>{item.cost}</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <div className="mt-2 p-3 bg-black/30 rounded-md text-xs text-gray-400">
            <p>
              NFT ที่ซื้อจะถูกสร้างบนบล็อกเชนและเป็นของคุณตลอดไป
              สามารถซื้อขายในตลาด NFT ได้
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dialog ยืนยันการ Mint NFT */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-gray-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle>ยืนยันการสร้าง NFT</DialogTitle>
            <DialogDescription>
              คุณกำลังจะสร้าง NFT "{selectedItem?.name}" ด้วยราคา{" "}
              {selectedItem?.cost} เหรียญ
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="p-4 bg-black/30 rounded-lg border border-purple-500/30">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Badge
                    className={`absolute -top-2 -right-2 ${
                      selectedItem.rarity === "common"
                        ? "bg-gray-500"
                        : selectedItem.rarity === "uncommon"
                        ? "bg-green-500"
                        : selectedItem.rarity === "rare"
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {selectedItem.rarity}
                  </Badge>
                  <div className="w-16 h-16 bg-purple-900/30 rounded-md flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedItem.description}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    <span>{selectedItem.cost} เหรียญ</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-400">
                <p>
                  การสร้าง NFT จะใช้ gas fee บนเครือข่ายบล็อกเชน
                  คุณจะต้องยืนยันธุรกรรมในกระเป๋าเงินของคุณ
                </p>
              </div>
            </div>
          )}

          {mintingStatus === "processing" && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>กำลังสร้าง NFT...</span>
                <span>{mintProgress}%</span>
              </div>
              <Progress value={mintProgress} className="h-2" />
              <p className="text-xs text-gray-400 mt-2">
                โปรดรออีกสักครู่ ระบบกำลังดำเนินการบันทึกข้อมูลลงบล็อกเชน
              </p>
              {txHash && (
                <div className="mt-1 text-xs font-mono text-blue-300 truncate">
                  TX: {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </div>
              )}
            </div>
          )}

          {mintingStatus === "error" && errorMessage && (
            <Alert
              variant="destructive"
              className="bg-red-950 border-red-800 text-red-200"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>เกิดข้อผิดพลาดในการสร้าง NFT</AlertTitle>
              <AlertDescription className="mt-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm truncate">
                    {errorMessage.length > 50
                      ? `${errorMessage.substring(0, 50)}...`
                      : errorMessage}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowErrorDetails(!showErrorDetails)}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
                {showErrorDetails && (
                  <div className="mt-2 p-2 bg-red-900/30 rounded text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
                    {errorMessage}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setMintingStatus("idle");
                setErrorMessage(null);
                setMintProgress(0);
                setTxHash(null);
              }}
              disabled={mintingStatus === "processing"}
            >
              {mintingStatus === "error" ? "ปิด" : "ยกเลิก"}
            </Button>
            {mintingStatus === "error" ? (
              <Button
                onClick={handleRetry}
                className="bg-blue-600 hover:bg-blue-700"
              >
                ลองใหม่
              </Button>
            ) : (
              <Button
                onClick={handleConfirmMint}
                disabled={mintingStatus !== "idle" || !selectedItem}
                className={`${
                  mintingStatus === "processing"
                    ? "bg-blue-600"
                    : mintingStatus === "success"
                    ? "bg-green-600"
                    : "bg-red-600"
                }`}
              >
                {mintingStatus === "processing"
                  ? "กำลังสร้าง NFT..."
                  : mintingStatus === "success"
                  ? "สร้าง NFT สำเร็จ!"
                  : "เกิดข้อผิดพลาด"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog ยืนยันการขาย NFT */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-purple-500/50">
          <DialogHeader>
            <DialogTitle>ยืนยันการขาย NFT</DialogTitle>
            <DialogDescription>
              คุณต้องการขาย NFT "{nftToDelete?.name}" ใช่หรือไม่?
              การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="w-16 h-16 bg-purple-900/30 rounded-md flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium">{nftToDelete?.name}</h4>
              <p className="text-sm text-gray-400">#{nftToDelete?.tokenId}</p>
              <Badge
                className={`mt-1 ${
                  nftToDelete?.rarity === "common"
                    ? "bg-gray-500"
                    : nftToDelete?.rarity === "uncommon"
                    ? "bg-green-500"
                    : nftToDelete?.rarity === "rare"
                    ? "bg-blue-500"
                    : "bg-purple-500"
                }`}
              >
                {nftToDelete?.rarity}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              ยืนยันการขาย
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
