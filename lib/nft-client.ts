"use client";

import { ethers } from "ethers";
import { AdventureNFTABI } from "./contracts/AdventureNFT.abi";

// NFT contract address from environment variable
const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"; // Placeholder

// Function to get a typed NFT contract instance
export const getNFTContract = async (signer: ethers.Signer) => {
  return new ethers.Contract(NFT_CONTRACT_ADDRESS!, AdventureNFTABI, signer);
};

/**
 * Mints the single "access" NFT for the connected user.
 * This token is required to use special features of the dApp.
 */
export const mintAccessNFT = async (signer: ethers.Signer) => {
  const contract = await getNFTContract(signer);
  const tx = await contract.mintAccessNFT();
  const receipt = await tx.wait();
  return {
    success: true,
    txHash: receipt.hash,
  };
};

/**
 * Mints a specified amount of a given asset for the connected user.
 * @param signer The ethers signer object for the user.
 * @param tokenId The ID of the asset to mint.
 * @param amount The quantity of the asset to mint.
 */
export const mintAsset = async (signer: ethers.Signer, tokenId: number, amount: number) => {
  const contract = await getNFTContract(signer);
  const tx = await contract.mintAsset(tokenId, amount);
  const receipt = await tx.wait();
  return {
    success: true,
    txHash: receipt.hash,
  };
};

/**
 * Burns a specified amount of a given asset from the user's wallet.
 * @param signer The ethers signer object for the user.
 * @param ownerAddress The address of the user burning the tokens.
 * @param tokenId The ID of the asset to burn.
 * @param amount The quantity of the asset to burn.
 */
export const burnAsset = async (signer: ethers.Signer, ownerAddress: string, tokenId: number, amount: number) => {
    const contract = await getNFTContract(signer);
    const tx = await contract.burn(ownerAddress, tokenId, amount);
    const receipt = await tx.wait();
    return {
        success: true,
        txHash: receipt.hash,
    };
};
