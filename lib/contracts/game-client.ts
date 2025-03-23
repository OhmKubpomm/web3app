import { ethers } from "ethers";
import gameABI from "./game-abi.json";

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
      return new ethers.Contract(GAME_CONTRACT_ADDRESS, gameABI, provider);
    }

    // With signer (for write operations)
    return new ethers.Contract(GAME_CONTRACT_ADDRESS, gameABI, signer);
  } catch (error) {
    console.error("Error getting game contract:", error);
    throw error;
  }
};

// Function to register a new player
export const registerPlayer = async (signer: ethers.Signer) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.registerPlayer();
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
    const tx = await contract.attackMonster(monsterId);
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
    const tx = await contract.multiAttack(attackCount);
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
    const tx = await contract.changeArea(newArea);
    return await tx.wait();
  } catch (error) {
    console.error("Error changing area:", error);
    throw error;
  }
};

// Function to mint an item
export const mintItem = async (
  signer: ethers.Signer,
  recipient: string,
  tokenURI: string,
  itemType: string
) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.mintItem(recipient, tokenURI, itemType);
    const receipt = await tx.wait();

    // Find the ItemMinted event in the receipt
    const event = receipt.logs
      .filter((log: any) => log.fragment?.name === "ItemMinted")
      .map((log: any) => contract.interface.parseLog(log))[0];

    if (event) {
      return {
        tokenId: event.args.tokenId.toString(),
        player: event.args.player,
        itemType: event.args.itemType,
      };
    }

    return receipt;
  } catch (error) {
    console.error("Error minting item:", error);
    throw error;
  }
};

// Function to claim daily reward
export const claimDailyReward = async (signer: ethers.Signer) => {
  try {
    const contract = await getGameContract(signer);
    const tx = await contract.claimDailyReward();
    return await tx.wait();
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    throw error;
  }
};

// Function to get player data
export const getPlayerData = async (playerAddress: string) => {
  try {
    const contract = await getGameContract();
    const data = await contract.getPlayerData(playerAddress);

    return {
      level: Number(data.level),
      experience: Number(data.experience),
      coins: Number(data.coins),
      damage: Number(data.damage),
      autoDamage: Number(data.autoDamage),
      currentArea: data.currentArea,
      lastUpdated: new Date(Number(data.lastUpdated) * 1000),
    };
  } catch (error) {
    console.error("Error getting player data:", error);
    throw error;
  }
};
