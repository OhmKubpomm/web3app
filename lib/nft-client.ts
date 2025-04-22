"use client";

import { ethers } from "ethers";
import { NFTContract } from "@/lib/contracts/nft-contract";
import { toast } from "sonner";

// NFT contract address from environment variable
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS;

// Function to get NFT contract instance
export const getNFTContract = async (signer?: ethers.Signer) => {
  if (!NFT_CONTRACT_ADDRESS) {
    throw new Error("NFT contract address not found in environment variables");
  }

  try {
    // If no signer provided, use provider only (read-only)
    if (!signer) {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No ethereum provider found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      return new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFTContract.abi,
        provider
      );
    }

    // With signer (for write operations)
    return new ethers.Contract(NFT_CONTRACT_ADDRESS, NFTContract.abi, signer);
  } catch (error) {
    console.error("Error getting NFT contract:", error);
    throw error;
  }
};

// UTF-8 to Base64 conversion with fallbacks
const utf8ToBase64 = (str: string) => {
  try {
    return Buffer.from(str).toString("base64");
  } catch (error) {
    console.error("Error encoding to base64:", error);
    try {
      return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
          String.fromCharCode(Number.parseInt(p1, 16))
        )
      );
    } catch (e) {
      console.error("Fallback encoding failed:", e);
      return btoa("error_encoding_string");
    }
  }
};

// Function to mint NFT with enhanced error handling
export const mintNFT = async (
  signer: ethers.Signer,
  recipient: string,
  metadata: any
) => {
  try {
    const contract = await getNFTContract(signer);

    // Create metadata URI
    const tokenURI = `data:application/json;base64,${utf8ToBase64(
      JSON.stringify(metadata)
    )}`;

    console.log("Minting NFT with URI:", tokenURI.substring(0, 64) + "...");
    console.log("Contract address:", NFT_CONTRACT_ADDRESS);
    console.log("Recipient address:", recipient);

    // Call mintNFT function with increased gas limit and more precise estimation
    const gasEstimate = await contract.mintNFT.estimateGas(recipient, tokenURI).catch(
      (error) => {
        console.warn("Gas estimation failed, using default limit:", error);
        return 3000000; // Higher default if estimation fails
      }
    );
    
    // Add 20% buffer to the estimated gas
    const gasLimit = Math.floor(
      typeof gasEstimate === "number" ? gasEstimate * 1.2 : 3000000
    );
    
    console.log("Using gas limit for mint:", gasLimit);
    
    const tx = await contract.mintNFT(recipient, tokenURI, {
      gasLimit,
    });

    console.log("Transaction sent:", tx.hash);

    // Wait for transaction confirmation with retry mechanism
    let receipt;
    let retries = 3;
    
    while (retries > 0) {
      try {
        receipt = await tx.wait();
        break;
      } catch (err) {
        console.warn("Transaction confirmation attempt failed, retrying...", err);
        retries--;
        if (retries === 0) throw err;
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
      }
    }
    
    console.log("Transaction confirmed:", receipt.hash);

    // Get tokenId from event
    let tokenId = 0;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "Transfer") {
          tokenId = Number(parsedLog.args.tokenId);
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }

    return {
      success: true,
      tokenId,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    
    if (error.code === "ACTION_REJECTED") {
      throw new Error("User rejected transaction");
    }
    
    if (error.code === "CALL_EXCEPTION") {
      console.log("Transaction receipt:", error.receipt);
      throw new Error(`Contract error: ${error.reason || "Unknown contract error"}`);
    }
    
    // Handle rate limiting errors
    if (error.message && (
      error.message.includes("rate limit") || 
      error.message.includes("429") ||
      error.message.includes("Too Many Requests")
    )) {
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    
    throw error;
  }
};

// Batch mint NFT function
export const batchMintNFT = async (
  signer: ethers.Signer,
  recipient: string,
  metadataArray: any[]
) => {
  try {
    const contract = await getNFTContract(signer);

    if (!contract.batchMintNFT) {
      console.error("batchMintNFT function not found in contract");
      throw new Error("Contract function not available");
    }

    // Create tokenURIs for each metadata
    const tokenURIs = metadataArray.map(
      (metadata) =>
        `data:application/json;base64,${utf8ToBase64(JSON.stringify(metadata))}`
    );

    console.log(`Batch minting ${tokenURIs.length} NFTs`);

    // Call batchMintNFT with adjusted gas limit
    const tx = await contract.batchMintNFT(recipient, tokenURIs, {
      gasLimit: 2000000 + tokenURIs.length * 300000, // Increased gas limit
    });

    console.log("Transaction sent:", tx.hash);

    const toastId = toast.loading(`Creating ${tokenURIs.length} NFTs`, {
      description: "Waiting for blockchain confirmation...",
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    // Extract tokenIds from event
    let tokenIds: number[] = [];
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "BatchMinted") {
          tokenIds = parsedLog.args.tokenIds.map((id: any) =>
            Number(id)
          );
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }

    toast.success(`Created ${tokenIds.length} NFTs successfully`, {
      id: toastId,
    });

    return {
      success: true,
      tokenIds,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("Error batch minting NFTs:", error);

    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      toast.error("Failed to create multiple NFTs", {
        description: "Smart contract rejected the transaction",
      });
    } else {
      toast.error("Failed to create multiple NFTs", {
        description: error.message || "Unknown error occurred",
      });
    }

    throw error;
  }
};

// Get NFT balance
export const getNFTBalance = async (ownerAddress: string) => {
  try {
    const contract = await getNFTContract();
    const balance = await contract.balanceOf(ownerAddress);
    return Number(balance);
  } catch (error) {
    console.error("Error getting NFT balance:", error);
    throw error;
  }
};

// Get NFT owner
export const getNFTOwner = async (tokenId: number) => {
  try {
    const contract = await getNFTContract();
    return await contract.ownerOf(tokenId);
  } catch (error) {
    console.error("Error getting NFT owner:", error);
    throw error;
  }
};

// Get NFT metadata
export const getNFTMetadata = async (tokenId: number) => {
  try {
    const contract = await getNFTContract();
    const tokenURI = await contract.tokenURI(tokenId);

    // Parse metadata from tokenURI
    if (tokenURI.startsWith("data:application/json;base64,")) {
      const base64Data = tokenURI.replace("data:application/json;base64,", "");
      const jsonString = atob(base64Data);
      return JSON.parse(jsonString);
    }

    // If it's a URL, fetch the metadata
    const response = await fetch(tokenURI);
    return await response.json();
  } catch (error) {
    console.error("Error getting NFT metadata:", error);
    throw error;
  }
};

// Batch get NFT metadata
export const getBatchNFTMetadata = async (tokenIds: number[]) => {
  try {
    const results = [];
    const contract = await getNFTContract();

    for (const tokenId of tokenIds) {
      try {
        const tokenURI = await contract.tokenURI(tokenId);
        let metadata;

        // Parse metadata from tokenURI
        if (tokenURI.startsWith("data:application/json;base64,")) {
          const base64Data = tokenURI.replace("data:application/json;base64,", "");
          const jsonString = atob(base64Data);
          metadata = JSON.parse(jsonString);
        } else {
          // If it's a URL, fetch the metadata
          const response = await fetch(tokenURI);
          metadata = await response.json();
        }

        results.push({
          tokenId,
          metadata,
          owner: await contract.ownerOf(tokenId),
        });
      } catch (error) {
        console.error(`Error getting metadata for token ${tokenId}:`, error);
        // Add placeholder for failed fetch
        results.push({
          tokenId,
          metadata: { name: `Token #${tokenId}`, description: "Metadata unavailable" },
          owner: "unknown",
          error: true,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error getting batch NFT metadata:", error);
    throw error;
  }
};
