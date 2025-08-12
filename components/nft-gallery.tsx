"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWeb3 } from "@/lib/web3-client";
import { toast } from "sonner";
import { Sparkles, RefreshCw, ExternalLink, X, PlusCircle, MinusCircle } from "lucide-react";

// This should match the structure of our 'nfts' table in Supabase
interface NFT {
  id: number; // This is the DB id
  token_id: number;
  owner_address: string;
  contract_address: string;
  chain_id: number;
  token_uri: string;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: {
      trait_type: string;
      value: string;
    }[];
  };
  created_at: string;
}

// A simple list of predefined assets users can mint.
// In a real app, this would come from a database or a configuration file.
const MINTABLE_ASSETS = [
    { id: 1, name: "Health Potion" },
    { id: 2, name: "Mana Potion" },
    { id: 10, name: "Bronze Sword" },
    { id: 11, name: "Iron Shield" },
];

export default function NFTGallery() {
  const { address, chainId, mintAsset, burnAsset, mintAccessNFT } = useWeb3();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [burnAmount, setBurnAmount] = useState(1);

  const hasAccessNFT = nfts.some(nft => nft.token_id === 0);

  const fetchNfts = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/nfts?address=${address}`);
      if (!response.ok) {
        throw new Error("Failed to fetch NFTs");
      }
      const data = await response.json();
      setNfts(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching NFTs", { description: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchNfts();
  }, [fetchNfts]);

  const handleMint = async (tokenId: number, amount: number) => {
    setIsMinting(true);
    try {
      await mintAsset(tokenId, amount);
      toast.success("Asset minted successfully! Refreshing gallery...");
      await fetchNfts(); // Refresh data
    } catch (error) {
      // Error toast is already handled in web3-client
    } finally {
      setIsMinting(false);
    }
  };

  const handleBurn = async () => {
      if (!selectedNft) return;
      setIsBurning(true);
      try {
          await burnAsset(selectedNft.token_id, burnAmount);
          toast.success("Asset burnt successfully! Refreshing gallery...");
          setSelectedNft(null); // Close detail view
          await fetchNfts(); // Refresh data
      } catch (error) {
          // Error handling is in web3-client
      } finally {
          setIsBurning(false);
      }
  };

  const handleMintAccessNFT = async () => {
      setIsMinting(true);
      try {
          await mintAccessNFT();
          toast.success("Access NFT minted! You now have access to special features.");
          await fetchNfts();
      } catch (error) {
          // Error handling in web3-client
      } finally {
          setIsMinting(false);
      }
  };

  const getRarityColor = (rarity: string) => {
    // A simple rarity heuristic based on one of the attributes
    switch (rarity?.toLowerCase()) {
      case "common": return "bg-gray-500";
      case "uncommon": return "bg-green-500";
      case "rare": return "bg-blue-500";
      case "epic": return "bg-purple-500";
      case "legendary": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  const getExplorerUrl = () => {
    if (!chainId) return "https://etherscan.io";
    const explorers: Record<number, string> = {
      1: "https://etherscan.io",
      137: "https://polygonscan.com",
      80001: "https://mumbai.polygonscan.com",
      11155111: "https://sepolia.etherscan.io",
      8453: "https://basescan.org",
      84532: "https://sepolia.basescan.org",
    };
    return explorers[chainId] || "https://etherscan.io";
  };

  if (isLoading) {
      return <div>Loading NFTs...</div>;
  }

  return (
    <Card className="border-purple-500/30 bg-black/40 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                <span>My Game Assets</span>
            </CardTitle>
            <div className="flex items-center gap-2">
                <Button onClick={() => handleMint(MINTABLE_ASSETS[0].id, 1)} disabled={isMinting}>
                    <PlusCircle className="mr-2 h-4 w-4"/> Mint a Potion
                </Button>
                <Button onClick={handleMintAccessNFT} disabled={isMinting || hasAccessNFT} variant={hasAccessNFT ? "secondary" : "default"}>
                    {hasAccessNFT ? "Access Granted" : "Mint Access NFT"}
                </Button>
                <Button variant="outline" size="icon" onClick={fetchNfts} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <AnimatePresence mode="wait">
                {selectedNft ? (
                    <motion.div key="details" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Button onClick={() => setSelectedNft(null)}><X className="mr-2"/> Back</Button>
                        <h3 className="text-lg font-bold">{selectedNft.metadata.name}</h3>
                        <img src={selectedNft.metadata.image} alt={selectedNft.metadata.name} className="w-full h-auto rounded-lg my-2"/>
                        <p>{selectedNft.metadata.description}</p>
                        <div className="mt-4">
                            <h4 className="font-bold">Burn Asset</h4>
                            <div className="flex items-center gap-2 mt-2">
                                <Input type="number" value={burnAmount} onChange={e => setBurnAmount(parseInt(e.target.value, 10))} className="max-w-xs" min="1"/>
                                <Button onClick={handleBurn} variant="destructive" disabled={isBurning}>
                                    <MinusCircle className="mr-2 h-4 w-4"/> {isBurning ? "Burning..." : "Burn"}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        {nfts.length === 0 ? (
                            <div className="text-center py-12">
                                <h3 className="text-xl font-semibold mb-2">No NFTs Found</h3>
                                <p className="text-gray-400">Mint your first asset to see it appear here.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {nfts.map((nft) => (
                                    <motion.div
                                        key={nft.id}
                                        className="cursor-pointer"
                                        whileHover={{ y: -5 }}
                                        onClick={() => setSelectedNft(nft)}
                                    >
                                        <div className="bg-black/30 rounded-lg overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-colors">
                                            <img src={nft.metadata.image} alt={nft.metadata.name} className="w-full h-48 object-cover"/>
                                            <div className="p-4">
                                                <h3 className="font-bold truncate">{nft.metadata.name} (ID: {nft.token_id})</h3>
                                                <p className="text-xs text-gray-400 truncate">{nft.metadata.description}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </CardContent>
    </Card>
  );
}
