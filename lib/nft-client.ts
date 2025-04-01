"use client";

import { ethers } from "ethers";
import { NFTContract } from "@/lib/contracts/nft-contract";

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

// Function to mint NFT
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

    console.log("Minting NFT with URI:", tokenURI);
    console.log("Contract address:", NFT_CONTRACT_ADDRESS);
    console.log("Recipient address:", recipient);

    // Call mintNFT function with higher gas limit
    const tx = await contract.mintNFT(recipient, tokenURI, {
      gasLimit: 5000000, // Increase gas limit
    });

    console.log("Transaction sent:", tx.hash);

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

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
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
};

// Function to get NFT balance
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

// Function to get NFT owner
export const getNFTOwner = async (tokenId: number) => {
  try {
    const contract = await getNFTContract();
    return await contract.ownerOf(tokenId);
  } catch (error) {
    console.error("Error getting NFT owner:", error);
    throw error;
  }
};

// Function to get NFT metadata
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
