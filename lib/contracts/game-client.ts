"use client";

import { ethers } from "ethers";
import { GameContract } from "@/lib/contracts/game-contract";

// Game contract address from environment variable
const GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS;

// Function to get contract instance
export const getGameContract = async (signer?: ethers.Signer) => {
  if (!GAME_CONTRACT_ADDRESS) {
    throw new Error("Game contract address not found in environment variables");
  }

  try {
    // If no signer provided, use provider only (read-only)
    if (!signer) {
      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("No ethereum provider found");
      }
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Use the ABI from the GameContract import
      return new ethers.Contract(
        GAME_CONTRACT_ADDRESS,
        GameContract.abi,
        provider
      );
    }

    // With signer (for write operations)
    return new ethers.Contract(GAME_CONTRACT_ADDRESS, GameContract.abi, signer);
  } catch (error) {
    console.error("Error getting game contract:", error);
    throw error;
  }
};

// Function to register a new player
export const registerPlayer = async (signer: ethers.Signer) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.registerPlayer({
      gasLimit: 3000000, // Increase gas limit to prevent out of gas errors
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error registering player:", error);
    throw error;
  }
};

// Function to attack a monster
export const attackMonster = async (
  signer: ethers.Signer,
  monsterId: number
) => {
  try {
    const contract = await getGameContract(signer);
    // Make sure to use the correct function name from your contract
    const tx = await contract.attack(monsterId, {
      gasLimit: 5000000, // Increase gas limit
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error attacking monster:", error);
    throw error;
  }
};

// Function to attack multiple times
export const multiAttack = async (
  signer: ethers.Signer,
  attackCount: number
) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.multiAttack(attackCount, {
      gasLimit: 5000000, // Increase gas limit
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error multi-attacking:", error);
    throw error;
  }
};

// Function to change area
export const changeArea = async (signer: ethers.Signer, newArea: string) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.changeArea(newArea, {
      gasLimit: 3000000, // Increase gas limit
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error changing area:", error);
    throw error;
  }
};

// Function to mint an NFT item
export const mintItemNFT = async (signer: ethers.Signer, itemId: number) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.mintItemNFT(itemId, {
      gasLimit: 5000000, // Increase gas limit
    });
    const receipt = await tx.wait();

    // Find the NFTMinted event in the receipt
    let tokenId = 0;
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "NFTMinted") {
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
    console.error("Error minting item NFT:", error);
    throw error;
  }
};

// Function to upgrade character
export const upgradeCharacter = async (
  signer: ethers.Signer,
  characterId: number
) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.upgradeCharacter(characterId, {
      gasLimit: 3000000, // Increase gas limit
    });
    return await tx.wait();
  } catch (error) {
    console.error("Error upgrading character:", error);
    throw error;
  }
};

// Function to get player data
export const getPlayerData = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();
    const data = await contract.getPlayerData(playerAddress);

    // Format the data based on your contract's return structure
    return {
      coins: Number(data.coins),
      damage: Number(data.damage),
      autoDamage: Number(data.autoDamage),
      lastAttackTime: Number(data.lastAttackTime),
      monstersDefeated: Number(data.monstersDefeated),
      currentArea: data.currentArea,
      exists: data.exists,
    };
  } catch (error) {
    console.error("Error getting player data:", error);
    throw error;
  }
};

// Function to get player characters
export const getPlayerCharacters = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();
    const characters = await contract.getPlayerCharacters(playerAddress);

    // Format the characters data
    return characters.map((char: any) => ({
      id: Number(char.id),
      name: char.name,
      level: Number(char.level),
      damage: Number(char.damage),
      defense: Number(char.defense),
      cost: Number(char.cost),
    }));
  } catch (error) {
    console.error("Error getting player characters:", error);
    throw error;
  }
};

// Function to get monsters in area
export const getMonstersInArea = async (area: string) => {
  try {
    const contract = await getGameContract();
    const monsters = await contract.getMonstersInArea(area);

    // Format the monsters data
    return monsters.map((monster: any) => ({
      id: Number(monster.id),
      name: monster.name,
      hp: Number(monster.hp),
      maxHp: Number(monster.maxHp),
      reward: Number(monster.reward),
      monsterType: monster.monsterType,
    }));
  } catch (error) {
    console.error("Error getting monsters in area:", error);
    throw error;
  }
};

// Function to check if player is registered
export const isPlayerRegistered = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();
    const playerData = await contract.getPlayerData(playerAddress);
    return playerData && playerData.exists;
  } catch (error) {
    console.error("Error checking player registration:", error);
    return false;
  }
};
