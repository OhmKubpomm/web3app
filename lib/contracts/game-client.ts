"use client";

import { ethers } from "ethers";
import { GameContract } from "@/lib/contracts/game-contract";
import { toast } from "sonner";

// Game contract address from environment variable
const GAME_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS;

// ฟังก์ชันสำหรับดึง provider และ signer
export const getProviderAndSigner = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No ethereum provider found");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return { provider, signer };
};

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

    // Check if the function exists in the contract
    if (!contract.registerPlayer) {
      console.error("registerPlayer function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.registerPlayer({
      gasLimit: 1000000, // ลดค่า gas limit ลง
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error registering player:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error("การลงทะเบียนล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ");
    }

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

    // Check if the function exists in the contract
    if (!contract.attack) {
      console.error("attack function not found in contract");
      throw new Error("Contract function not available");
    }

    // Make sure to use the correct function name from your contract
    const tx = await contract.attack(monsterId, {
      gasLimit: 1000000, // ลดค่า gas limit ลง
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error attacking monster:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error("การโจมตีล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ");
    }

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

    // Check if the function exists in the contract
    if (!contract.multiAttack) {
      console.error("multiAttack function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.multiAttack(attackCount, {
      gasLimit: 2000000, // ปรับค่า gas limit ให้เหมาะสม
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error multi-attacking:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error(
        "การโจมตีหลายครั้งล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ"
      );
    }

    throw error;
  }
};

// ฟังก์ชันใหม่: โจมตีมอนสเตอร์หลายตัวพร้อมกัน
export const batchAttack = async (
  signer: ethers.Signer,
  monsterIds: number[]
) => {
  try {
    const contract = await getGameContract(signer);

    // Check if the function exists in the contract
    if (!contract.batchAttack) {
      console.error("batchAttack function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.batchAttack(monsterIds, {
      gasLimit: 3000000, // ปรับค่า gas limit ให้เหมาะสมกับจำนวนมอนสเตอร์
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error batch attacking:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error("การโจมตีหลายตัวล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ");
    }

    throw error;
  }
};

// Function to change area
export const changeArea = async (signer: ethers.Signer, newArea: string) => {
  try {
    const contract = await getGameContract(signer);

    // Check if the function exists in the contract
    if (!contract.changeArea) {
      console.error("changeArea function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.changeArea(newArea, {
      gasLimit: 500000, // ลดค่า gas limit ลง
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error changing area:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error(
        "การเปลี่ยนพื้นที่ล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ"
      );
    }

    throw error;
  }
};

// Function to mint an NFT item
export const mintItemNFT = async (signer: ethers.Signer, itemId: number) => {
  try {
    const contract = await getGameContract(signer);

    // Check if the function exists in the contract
    if (!contract.mintItemNFT) {
      console.error("mintItemNFT function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.mintItemNFT(itemId, {
      gasLimit: 1000000, // ลดค่า gas limit ลง
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
  } catch (error: any) {
    console.error("Error minting item NFT:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error("การสร้าง NFT ล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ");
    }

    throw error;
  }
};

// ฟังก์ชันใหม่: mint NFT หลายชิ้นพร้อมกัน
export const batchMintItemNFTs = async (
  signer: ethers.Signer,
  itemIds: number[]
) => {
  try {
    const contract = await getGameContract(signer);

    // Check if the function exists in the contract
    if (!contract.batchMintItemNFTs) {
      console.error("batchMintItemNFTs function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.batchMintItemNFTs(itemIds, {
      gasLimit: 3000000, // ปรับค่า gas limit ให้เหมาะสมกับจำนวน NFT
    });
    const receipt = await tx.wait();

    // Find the BatchNFTMinted event in the receipt
    let tokenIds: number[] = [];
    for (const log of receipt.logs) {
      try {
        const parsedLog = contract.interface.parseLog(log);
        if (parsedLog && parsedLog.name === "BatchNFTMinted") {
          tokenIds = parsedLog.args.tokenIds.map((id: any) =>
            Number(id)
          );
          break;
        }
      } catch (e) {
        // Skip logs that can't be parsed
      }
    }

    return {
      success: true,
      tokenIds,
      txHash: receipt.hash,
    };
  } catch (error: any) {
    console.error("Error batch minting NFTs:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error(
        "การสร้าง NFT หลายชิ้นล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ"
      );
    }

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

    // Check if the function exists in the contract
    if (!contract.upgradeCharacter) {
      console.error("upgradeCharacter function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.upgradeCharacter(characterId, {
      gasLimit: 500000, // ลดค่า gas limit ลง
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error upgrading character:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error(
        "การอัพเกรดตัวละครล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ"
      );
    }

    throw error;
  }
};

// ฟังก์ชันใหม่: อัพเกรดตัวละครหลายตัวพร้อมกัน
export const batchUpgradeCharacters = async (
  signer: ethers.Signer,
  characterIds: number[]
) => {
  try {
    const contract = await getGameContract(signer);

    // Check if the function exists in the contract
    if (!contract.batchUpgradeCharacters) {
      console.error("batchUpgradeCharacters function not found in contract");
      throw new Error("Contract function not available");
    }

    const tx = await contract.batchUpgradeCharacters(characterIds, {
      gasLimit: 2000000, // ปรับค่า gas limit ให้เหมาะสมกับจำนวนตัวละคร
    });
    return await tx.wait();
  } catch (error: any) {
    console.error("Error batch upgrading characters:", error);

    // Handle specific error types
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      throw new Error(
        "การอัพเกรดตัวละครหลายตัวล้มเหลว: สัญญาอัจฉริยะปฏิเสธการทำรายการ"
      );
    }

    throw error;
  }
};

// Function to get player data
export const getPlayerData = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();

    // Check if the function exists in the contract
    if (!contract.getPlayerData) {
      console.error("getPlayerData function not found in contract");
      throw new Error("Contract function not available");
    }

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
  } catch (error: any) {
    console.error("Error getting player data:", error);

    // For read operations, return a default object instead of throwing
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      return {
        coins: 0,
        damage: 1,
        autoDamage: 0,
        lastAttackTime: 0,
        monstersDefeated: 0,
        currentArea: "ป่า",
        exists: false,
      };
    }

    throw error;
  }
};

// Function to get player characters
export const getPlayerCharacters = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();

    // Check if the function exists in the contract
    if (!contract.getPlayerCharacters) {
      console.error("getPlayerCharacters function not found in contract");
      throw new Error("Contract function not available");
    }

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
  } catch (error: any) {
    console.error("Error getting player characters:", error);

    // For read operations, return an empty array instead of throwing
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      return [];
    }

    throw error;
  }
};

// Function to get monsters in area
export const getMonstersInArea = async (area: string) => {
  try {
    const contract = await getGameContract();

    // Check if the function exists in the contract
    if (!contract.getMonstersInArea) {
      console.error("getMonstersInArea function not found in contract");
      throw new Error("Contract function not available");
    }

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
  } catch (error: any) {
    console.error("Error getting monsters in area:", error);

    // For read operations, return an empty array instead of throwing
    if (error.message && error.message.includes("CALL_EXCEPTION")) {
      return [];
    }

    throw error;
  }
};

// Function to check if player is registered
export const isPlayerRegistered = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();
    
    // Implement retry logic for potential rate limiting
    let retries = 3;
    let result;
    
    while (retries > 0) {
      try {
        result = await contract.getPlayerData(playerAddress);
        break;
      } catch (error: any) {
        console.warn(`Attempt to check player registration failed, retries left: ${retries-1}`, error);
        
        // If we get a decode error, the player is likely not registered
        if (error.message && (
          error.message.includes("could not decode") || 
          error.code === "BAD_DATA"
        )) {
          return false;
        }
        
        // If rate limited, wait longer between retries
        if (error.message && (
          error.message.includes("rate limit") ||
          error.message.includes("429") ||
          error.message.includes("Too Many Requests")
        )) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        }
        
        retries--;
        if (retries === 0) {
          if (error.code === "CALL_EXCEPTION" || error.message?.includes("CALL_EXCEPTION")) {
            return false; // Assume not registered on call exception after retries
          }
          throw error; // Re-throw other errors
        }
      }
    }
    
    // Check if result is empty or undefined
    if (!result || result === "0x" || Object.keys(result).length === 0) {
      return false;
    }
    
    return result.exists === true;
  } catch (error: any) {
    console.error("Error checking player registration:", error);
    
    // Handle common errors more gracefully
    if (
      error.message?.includes("could not decode") || 
      error.code === "BAD_DATA" ||
      error.message?.includes("invalid BigNumber")
    ) {
      return false;
    }
    
    throw error;
  }
};

// Function to simulate an attack (fallback when contract call fails)
export const simulateAttack = async (
  monsterId: number,
  playerDamage: number
) => {
  // Simple simulation logic
  const monsterHP = 10 * (monsterId + 1);
  const damage = playerDamage;
  const defeated = damage >= monsterHP;
  const reward = defeated ? monsterId * 5 + 10 : 0;

  return {
    damage,
    defeated,
    reward,
    simulated: true,
  };
};

// Function to simulate multi-attack (fallback when contract call fails)
export const simulateMultiAttack = async (
  attackCount: number,
  playerDamage: number
) => {
  // Simple simulation logic
  const totalDamage = playerDamage * attackCount;
  const monstersDefeated = Math.floor(totalDamage / 10);
  const totalReward = monstersDefeated * 15;

  return {
    totalDamage,
    monstersDefeated,
    totalReward,
    simulated: true,
  };
};

// ฟังก์ชันใหม่: ทำธุรกรรมหลายรายการพร้อมกัน
export const batchTransactions = async (
  signer: ethers.Signer,
  transactions: Array<{
    type:
      | "attack"
      | "multiAttack"
      | "batchAttack"
      | "upgradeCharacter"
      | "mintNFT"
      | "changeArea";
    params: any[];
  }>
) => {
  try {
    const results = [];
    const toastId = toast.loading("กำลังทำธุรกรรมหลายรายการ...", {
      description: `0/${transactions.length} รายการเสร็จสิ้น`,
    });

    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      let result;

      try {
        switch (tx.type) {
          case "attack":
            result = await attackMonster(signer, tx.params[0]);
            break;
          case "multiAttack":
            result = await multiAttack(signer, tx.params[0]);
            break;
          case "batchAttack":
            result = await batchAttack(signer, tx.params[0]);
            break;
          case "upgradeCharacter":
            result = await upgradeCharacter(signer, tx.params[0]);
            break;
          case "mintNFT":
            result = await mintItemNFT(signer, tx.params[0]);
            break;
          case "changeArea":
            result = await changeArea(signer, tx.params[0]);
            break;
          default:
            throw new Error("ไม่รู้จักประเภทธุรกรรม");
        }

        results.push({ success: true, result });

        // อัพเดต toast
        toast.loading(`กำลังทำธุรกรรมหลายรายการ...`, {
          id: toastId,
          description: `${i + 1}/${transactions.length} รายการเสร็จสิ้น`,
        });
      } catch (error) {
        console.error(`Error in transaction ${i} (${tx.type}):`, error);
        results.push({ success: false, error });

        // อัพเดต toast แต่ไม่หยุดการทำงาน
        toast.loading(`กำลังทำธุรกรรมหลายรายการ...`, {
          id: toastId,
          description: `${i + 1}/${
            transactions.length
          } รายการเสร็จสิ้น (มีข้อผิดพลาด)`,
        });
      }
    }

    // อัพเดต toast เมื่อเสร็จสิ้นทั้งหมด
    toast.success(`ทำธุรกรรมเสร็จสิ้น`, {
      id: toastId,
      description: `${results.filter((r) => r.success).length}/${
        transactions.length
      } รายการสำเร็จ`,
    });

    return {
      success: results.some((r) => r.success),
      results,
    };
  } catch (error: any) {
    console.error("Error in batch transactions:", error);
    toast.error("เกิดข้อผิดพลาดในการทำธุรกรรม", {
      description: error.message || "ไม่สามารถทำธุรกรรมได้",
    });
    return {
      success: false,
      error: error.message,
    };
  }
};

// ฟังก์ชันใหม่: ทำธุรกรรมอัตโนมัติตามเวลา
export const autoTransactions = async (
  signer: ethers.Signer,
  transaction: {
    type: "attack" | "multiAttack" | "batchAttack";
    params: any[];
  },
  intervalSeconds: number,
  maxCount: number
) => {
  let count = 0;
  let successCount = 0;
  let intervalId: NodeJS.Timeout;

  const toastId = toast.loading("เริ่มทำธุรกรรมอัตโนมัติ...", {
    description: "กำลังเตรียมการ",
  });

  // ฟังก์ชันสำหรับทำธุรกรรม
  const executeTransaction = async () => {
    if (count >= maxCount) {
      clearInterval(intervalId);
      toast.success("ทำธุรกรรมอัตโนมัติเสร็จสิ้น", {
        id: toastId,
        description: `${successCount}/${maxCount} รายการสำเร็จ`,
      });
      return;
    }

    count++;

    try {
      let result;
      switch (transaction.type) {
        case "attack":
          result = await attackMonster(signer, transaction.params[0]);
          break;
        case "multiAttack":
          result = await multiAttack(signer, transaction.params[0]);
          break;
        case "batchAttack":
          result = await batchAttack(signer, transaction.params[0]);
          break;
        default:
          throw new Error("ไม่รู้จักประเภทธุรกรรม");
      }

      successCount++;

      // อัพเดต toast
      toast.loading("กำลังทำธุรกรรมอัตโนมัติ...", {
        id: toastId,
        description: `${count}/${maxCount} รายการ (${successCount} สำเร็จ)`,
      });
    } catch (error) {
      console.error(`Error in auto transaction ${count}:`, error);

      // อัพเดต toast แต่ไม่หยุดการทำงาน
      toast.loading("กำลังทำธุรกรรมอัตโนมัติ...", {
        id: toastId,
        description: `${count}/${maxCount} รายการ (${successCount} สำเร็จ, มีข้อผิดพลาด)`,
      });
    }
  };

  // เริ่มทำธุรกรรมครั้งแรกทันที
  await executeTransaction();

  // ตั้งเวลาทำธุรกรรมต่อไป
  intervalId = setInterval(executeTransaction, intervalSeconds * 1000);

  // คืนค่าฟังก์ชันสำหรับหยุดการทำงาน
  return {
    stop: () => {
      clearInterval(intervalId);
      toast.success("หยุดทำธุรกรรมอัตโนมัติแล้ว", {
        id: toastId,
        description: `${successCount}/${count} รายการสำเร็จ`,
      });
      return {
        totalCount: count,
        successCount,
      };
    },
  };
};
