"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Package,
  Search,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface InventoryPanelProps {
  gameData: any;
}

export default function InventoryPanel({ gameData }: InventoryPanelProps) {
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // กรองไอเทมตามการค้นหา
  const filteredItems = gameData.inventory.filter(
    (item: any) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rarity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // แบ่งหน้า
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // ฟังก์ชันเปลี่ยนหน้า
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // ฟังก์ชันเลือกไอเทม
  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
  };

  // ฟังก์ชันปิดรายละเอียดไอเทม
  const handleCloseDetails = () => {
    setSelectedItem(null);
  };

  // ฟังก์ชันแสดงสีตามความหายาก
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common":
        return "bg-gray-500";
      case "uncommon":
        return "bg-green-500";
      case "rare":
        return "bg-blue-500";
      case "epic":
        return "bg-purple-500";
      case "legendary":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="border-0 bg-transparent">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-400" />
            <span>อุปกรณ์</span>
          </CardTitle>
          <Badge variant="outline" className="flex gap-1 bg-black/30">
            <Shield className="h-4 w-4" />
            {gameData.inventory.length}/{gameData.upgrades.inventorySlots}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key="item-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="relative bg-black/40 border border-purple-500/50 rounded-lg p-6 mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleCloseDetails}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center mb-4">
                  <div className="relative mb-3">
                    <Image
                      src={selectedItem.image || "/placeholder.svg"}
                      alt={selectedItem.name}
                      width={100}
                      height={100}
                      className="rounded-lg border-2 border-purple-500/50"
                    />
                    <Badge
                      className={`absolute -top-2 -right-2 ${getRarityColor(
                        selectedItem.rarity
                      )}`}
                    >
                      {selectedItem.rarity}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold">{selectedItem.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {selectedItem.type}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-1">
                      คำอธิบาย
                    </h4>
                    <p className="text-sm">{selectedItem.description}</p>
                  </div>

                  {selectedItem.tokenId && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">
                        Token ID
                      </h4>
                      <p className="text-sm font-mono bg-black/30 p-2 rounded">
                        {selectedItem.tokenId}
                      </p>
                    </div>
                  )}

                  {selectedItem.mintedAt && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-400 mb-1">
                        สร้างเมื่อ
                      </h4>
                      <p className="text-sm">
                        {new Date(selectedItem.mintedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-center">
                  <Button variant="outline" className="border-purple-500/50">
                    ใช้งานไอเทม
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full"
                onClick={handleCloseDetails}
              >
                กลับไปยังรายการไอเทม
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="item-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ค้นหาไอเทม..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-black/30 border-purple-500/30"
                  />
                </div>
              </div>

              {gameData.inventory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Shield className="h-16 w-16 text-gray-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">ยังไม่มีไอเทม</h3>
                  <p className="text-gray-400 max-w-md">
                    ต่อสู้กับมอนสเตอร์เพื่อรับไอเทมและอาวุธที่สามารถเก็บเป็น NFT
                    ได้
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedItems.map((item: any, index: number) => (
                      <motion.div
                        key={item.tokenId || index}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectItem(item)}
                      >
                        <Card className="bg-black/40 border-purple-500/50 cursor-pointer hover:bg-black/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Image
                                  src={item.image || "/placeholder.svg"}
                                  alt={item.name}
                                  width={50}
                                  height={50}
                                  className="rounded-md"
                                />
                                <Badge
                                  className={`absolute -top-2 -right-2 ${getRarityColor(
                                    item.rarity
                                  )}`}
                                >
                                  {item.rarity}
                                </Badge>
                              </div>
                              <div>
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-xs text-gray-400">
                                  {item.description}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  {item.type}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>

                      <span className="text-sm">
                        หน้า {currentPage} จาก {totalPages}
                      </span>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
