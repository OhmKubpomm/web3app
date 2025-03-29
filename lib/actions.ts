"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getPlayerData,
  createPlayer,
  updatePlayerData,
  updateCharacter,
  updateUpgrades,
  addInventoryItem,
  updateQuestProgress,
  addBattleHistory,
  addPlayerActivity,
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase";

// ฟังก์ชันสำหรับบันทึกข้อมูลเกมของผู้เล่น
export async function saveGameData(address: string, gameData: any) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ตรวจสอบว่ามีผู้เล่นนี้ในฐานข้อมูลหรือไม่
    const existingUser = await getPlayerData(address);

    if (existingUser) {
      // อัพเดตข้อมูลผู้เล่นที่มีอยู่แล้ว
      const updated = await updatePlayerData(existingUser.id, {
        coins: gameData.coins,
        damage: gameData.damage,
        auto_damage: gameData.autoDamage,
        current_area: gameData.currentArea,
        last_login: new Date(),
      });

      if (!updated) {
        return { success: false, error: "Failed to update player data" };
      }
    } else {
      // สร้างผู้เล่นใหม่พร้อมข้อมูลเริ่มต้น
      const newPlayer = await createPlayer(address, {
        coins: gameData.coins || 0,
        damage: gameData.damage || 1,
        autoDamage: gameData.autoDamage || 0,
        currentArea: gameData.currentArea || "ป่า",
      });

      if (!newPlayer) {
        return { success: false, error: "Failed to create new player" };
      }
    }

    // ตั้งค่า cookie เพื่อระบุผู้เล่น
    (await cookies()).set("player_address", address, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 วัน
      path: "/",
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error saving game data:", error);
    return { success: false, error: "Failed to save game data" };
  }
}

// ฟังก์ชันสำหรับโหลดข้อมูลเกมของผู้เล่น
export async function loadGameData(address: string) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      // ถ้าไม่มีข้อมูล ให้สร้างข้อมูลเริ่มต้น
      const initialData = {
        coins: 0,
        damage: 1,
        autoDamage: 0,
        currentArea: "ป่า",
        characters: [
          {
            id: 1,
            name: "นักผจญภัย",
            level: 1,
            damage: 1,
            cost: 0,
            image: "/placeholder.svg?height=80&width=80",
          },
        ],
        inventory: [],
        upgrades: {
          autoBattle: false,
          inventorySlots: 10,
          damageMultiplier: 1,
        },
        quests: [
          {
            id: 1,
            title: "ล่ามอนสเตอร์",
            description: "สังหารมอนสเตอร์ในพื้นที่ป่า จำนวน 10 ตัว",
            reward: 50,
            progress: 0,
            target: 10,
            type: "monster",
            completed: false,
            areaRequired: "ป่า",
          },
          {
            id: 2,
            title: "เก็บสมบัติ",
            description: "เก็บไอเทมจำนวน 3 ชิ้น",
            reward: 100,
            progress: 0,
            target: 3,
            type: "item",
            completed: false,
            areaRequired: null,
          },
        ],
        lastSaved: new Date().toISOString(),
      };

      // สร้างผู้เล่นใหม่ในฐานข้อมูล
      const newUser = await createPlayer(address, initialData);

      // ถ้าไม่สามารถสร้างผู้เล่นใหม่ได้ ให้ส่งข้อมูลเริ่มต้นกลับไป
      if (!newUser) {
        console.warn("Failed to create new player, returning initial data");
        return { success: true, data: initialData };
      }

      // แปลงข้อมูลให้ตรงกับรูปแบบที่แอปต้องการ
      const formattedData = {
        coins: 0,
        damage: 1,
        autoDamage: 0,
        currentArea: "ป่า",
        characters: initialData.characters,
        inventory: [],
        upgrades: initialData.upgrades,
        quests: initialData.quests,
        lastSaved: new Date().toISOString(),
      };

      return { success: true, data: formattedData };
    }

    // แปลงข้อมูลจากฐานข้อมูลให้ตรงกับรูปแบบที่แอปต้องการ
    const formattedData = {
      coins: user.coins || 0,
      damage: user.damage || 1,
      autoDamage: user.auto_damage || 0,
      currentArea: user.current_area || "ป่า",
      characters:
        user.characters?.map((char: any) => ({
          id: char.id,
          name: char.name,
          level: char.level,
          damage: char.damage,
          cost: char.level * 25, // คำนวณค่าอัพเกรด
          image: char.image,
        })) || [],
      inventory:
        user.inventory?.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          type: item.type,
          rarity: item.rarity,
          image: item.image,
          tokenId: item.token_id,
          mintedAt: item.minted_at
            ? formatDateToISOString(formatDateValue(item.minted_at))
            : undefined,
        })) || [],
      upgrades: {
        autoBattle: user.upgrades?.auto_battle || false,
        inventorySlots: user.upgrades?.inventory_slots || 10,
        damageMultiplier: user.upgrades?.damage_multiplier || 1,
      },
      quests:
        user.quests?.map((quest: any) => ({
          id: quest.id,
          title: quest.title,
          description: quest.description,
          reward: quest.reward,
          progress: quest.progress,
          target: quest.target,
          type: quest.type,
          completed: quest.completed,
          areaRequired: quest.area_required,
        })) || [],
      // แก้ไขการใช้ toISOString() โดยตรวจสอบประเภทข้อมูลก่อน
      lastSaved:
        formatDateToISOString(user.updated_at) || new Date().toISOString(),
    };

    // แก้ไขการใช้ toISOString() โดยตรวจสอบประเภทข้อมูลก่อน
    const lastUpdated = formatDateValue(user.updated_at);

    // ใช้ตัวแปร lastUpdated แทน user.updated_at?.toISOString()
    const timeSinceLastUpdate = Date.now() - lastUpdated.getTime();

    return { success: true, data: formattedData };
  } catch (error) {
    console.error("Error loading game data:", error);

    // ในกรณีที่เกิดข้อผิดพลาด ให้ส่งข้อมูลเริ่มต้นกลับไป
    const fallbackData = {
      coins: 0,
      damage: 1,
      autoDamage: 0,
      currentArea: "ป่า",
      characters: [
        {
          id: 1,
          name: "นักผจญภัย",
          level: 1,
          damage: 1,
          cost: 0,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      inventory: [],
      upgrades: {
        autoBattle: false,
        inventorySlots: 10,
        damageMultiplier: 1,
      },
      quests: [],
      lastSaved: new Date().toISOString(),
    };

    return {
      success: true,
      data: fallbackData,
      error: "Using fallback data due to error",
    };
  }
}

// ฟังก์ชันช่วยในการแปลงค่าวันที่เป็น ISO string
function formatDateToISOString(dateValue: any): string {
  if (!dateValue) return new Date().toISOString();

  if (typeof dateValue === "string") {
    // ถ้าเป็น string ให้แปลงเป็น Date object ก่อน
    return new Date(dateValue).toISOString();
  } else if (dateValue instanceof Date) {
    // ถ้าเป็น Date object ให้ใช้ toISOString() ได้เลย
    return dateValue.toISOString();
  } else {
    // กรณีอื่นๆ ให้ใช้วันที่ปัจจุบัน
    return new Date().toISOString();
  }
}

// ฟังก์ชันช่วยในการแปลงค่าวันที่เป็น Date object
function formatDateValue(dateValue: any): Date {
  if (!dateValue) return new Date();

  if (typeof dateValue === "string") {
    // ถ้าเป็น string ให้แปลงเป็น Date object
    return new Date(dateValue);
  } else if (dateValue instanceof Date) {
    // ถ้าเป็น Date object ให้ใช้ได้เลย
    return dateValue;
  } else {
    // กรณีอื่นๆ ให้ใช้วันที่ปัจจุบัน
    return new Date();
  }
}

// ฟังก์ชันสำหรับอัพเดตเหรียญของผู้เล่น
export async function updateCoins(address: string, amount: number) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // อัพเดตเหรียญ
    const updated = await updatePlayerData(user.id, {
      coins: (user.coins || 0) + amount,
    });

    if (!updated) {
      return { success: false, error: "Failed to update coins" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(user.id, "earn_coins", `ได้รับ ${amount} เหรียญ`);

    // โหลดข้อมูลล่าสุด
    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load updated data" };
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Error updating coins:", error);
    return { success: false, error: "Failed to update coins" };
  }
}

// ฟังก์ชันสำหรับทำภารกิจให้สำเร็จ
export async function completeQuest(address: string, questId: number) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // ค้นหาภารกิจ
    const quest = user.quests?.find((q: any) => q.id === questId);

    if (!quest) {
      return { success: false, error: "Quest not found" };
    }

    // อัพเดตสถานะภารกิจ
    const updated = await updateQuestProgress(questId, quest.target, true);

    if (!updated) {
      return { success: false, error: "Failed to update quest progress" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(
      user.id,
      "complete_quest",
      `ทำภารกิจ "${quest.title}" สำเร็จ`
    );

    return { success: true };
  } catch (error) {
    console.error("Error completing quest:", error);
    return { success: false, error: "Failed to complete quest" };
  }
}

// ฟังก์ชันสำหรับซื้อตัวละครใหม่
export async function buyCharacter(address: string, characterCost: number) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load game data" };
    }

    if (data.coins < characterCost) {
      return { success: false, error: "Not enough coins" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // สร้างตัวละครใหม่
    const newCharacter = {
      player_id: user.id,
      name: `นักผจญภัย ${user.characters?.length + 1 || 1}`,
      level: 1,
      damage: 1,
      image: "/placeholder.svg?height=80&width=80",
    };

    // อัพเดตเหรียญและพลังโจมตีอัตโนมัติ
    const updated = await updatePlayerData(user.id, {
      coins: (user.coins || 0) - characterCost,
      auto_damage: (user.auto_damage || 0) + 1,
    });

    if (!updated) {
      return { success: false, error: "Failed to update player data" };
    }

    // เพิ่มตัวละครใหม่
    try {
      const { data: character, error: characterError } = await supabase.client
        .from("characters")
        .insert([newCharacter])
        .select()
        .single();

      if (characterError) {
        console.error("Error creating character:", characterError);
        return { success: false, error: "Failed to create character" };
      }
    } catch (error) {
      console.error("Error creating character:", error);
      return { success: false, error: "Failed to create character" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(
      user.id,
      "buy_character",
      `จ้างนักผจญภัยคนใหม่ "${newCharacter.name}"`
    );

    // โหลดข้อมูลล่าสุด
    const {
      success: loadSuccess,
      data: updatedData,
      error: loadError,
    } = await loadGameData(address);

    if (!loadSuccess || !updatedData) {
      return {
        success: false,
        error: loadError || "Failed to load updated data",
      };
    }

    revalidatePath("/");
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error buying character:", error);
    return { success: false, error: "Failed to buy character" };
  }
}

// ฟังก์ชันสำหรับอัพเกรดตัวละคร
export async function upgradeCharacter(
  address: string,
  characterId: number,
  upgradeCost: number
) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load game data" };
    }

    if (data.coins < upgradeCost) {
      return { success: false, error: "Not enough coins" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // ค้นหาตัวละคร
    const character = user.characters?.find((c: any) => c.id === characterId);

    if (!character) {
      return { success: false, error: "Character not found" };
    }

    // อัพเดตเหรียญและพลังโจมตี
    const updated = await updatePlayerData(user.id, {
      coins: (user.coins || 0) - upgradeCost,
      damage: (user.damage || 1) + 1,
    });

    if (!updated) {
      return { success: false, error: "Failed to update player data" };
    }

    // อัพเกรดตัวละคร
    const characterUpdated = await updateCharacter(characterId, {
      level: character.level + 1,
      damage: character.damage + 1,
    });

    if (!characterUpdated) {
      return { success: false, error: "Failed to upgrade character" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(
      user.id,
      "upgrade_character",
      `อัพเกรดนักผจญภัย "${character.name}" เป็นระดับ ${character.level + 1}`
    );

    // โหลดข้อมูลล่าสุด
    const {
      success: loadSuccess,
      data: updatedData,
      error: loadError,
    } = await loadGameData(address);

    if (!loadSuccess || !updatedData) {
      return {
        success: false,
        error: loadError || "Failed to load updated data",
      };
    }

    revalidatePath("/");
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error upgrading character:", error);
    return { success: false, error: "Failed to upgrade character" };
  }
}

// ฟังก์ชันสำหรับซื้ออัพเกรดระบบ
export async function buyUpgrade(
  address: string,
  upgradeType: string,
  cost: number
) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load game data" };
    }

    if (data.coins < cost) {
      return { success: false, error: "Not enough coins" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // อัพเดตเหรียญ
    const coinUpdated = await updatePlayerData(user.id, {
      coins: (user.coins || 0) - cost,
    });

    if (!coinUpdated) {
      return { success: false, error: "Failed to update coins" };
    }

    // อัพเดตอัพเกรด
    let upgradeData: any = {};
    let playerData: any = {};

    switch (upgradeType) {
      case "autoBattle":
        upgradeData = { auto_battle: true };
        break;
      case "inventorySlots":
        upgradeData = {
          inventory_slots: (user.upgrades?.inventory_slots || 10) + 5,
        };
        break;
      case "damageMultiplier":
        upgradeData = {
          damage_multiplier: (user.upgrades?.damage_multiplier || 1) * 2,
        };
        playerData = { damage: (user.damage || 1) * 2 };
        break;
      default:
        return { success: false, error: "Invalid upgrade type" };
    }

    // อัพเดตอัพเกรด
    if (user.upgrades?.id) {
      const upgradeUpdated = await updateUpgrades(
        user.upgrades.id,
        upgradeData
      );
      if (!upgradeUpdated) {
        return { success: false, error: "Failed to update upgrades" };
      }
    }

    // อัพเดตข้อมูลผู้เล่น (ถ้าจำเป็น)
    if (Object.keys(playerData).length > 0) {
      const playerUpdated = await updatePlayerData(user.id, playerData);
      if (!playerUpdated) {
        return { success: false, error: "Failed to update player data" };
      }
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(
      user.id,
      "buy_upgrade",
      `ซื้ออัพเกรด "${upgradeType}"`
    );

    // โหลดข้อมูลล่าสุด
    const {
      success: loadSuccess,
      data: updatedData,
      error: loadError,
    } = await loadGameData(address);

    if (!loadSuccess || !updatedData) {
      return {
        success: false,
        error: loadError || "Failed to load updated data",
      };
    }

    revalidatePath("/");
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error buying upgrade:", error);
    return { success: false, error: "Failed to buy upgrade" };
  }
}

// ฟังก์ชันสำหรับเปลี่ยนพื้นที่ผจญภัย
export async function changeArea(address: string, newArea: string) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // อัพเดตพื้นที่
    const updated = await updatePlayerData(user.id, {
      current_area: newArea,
    });

    if (!updated) {
      return { success: false, error: "Failed to update area" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(user.id, "change_area", `เดินทางไปยัง${newArea}`);

    // โหลดข้อมูลล่าสุด
    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load updated data" };
    }

    revalidatePath("/");
    return { success: true, data };
  } catch (error) {
    console.error("Error changing area:", error);
    return { success: false, error: "Failed to change area" };
  }
}

// ฟังก์ชันสำหรับรับไอเทม NFT
export async function receiveNFTItem(address: string, item: any) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    const { success, data, error } = await loadGameData(address);

    if (!success || !data) {
      return { success: false, error: error || "Failed to load game data" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // ตรวจสอบว่าคลังเต็มหรือไม่
    if (user.inventory?.length >= (user.upgrades?.inventory_slots || 10)) {
      return { success: false, error: "Inventory is full" };
    }

    // เพิ่มไอเทมในคลัง
    const added = await addInventoryItem(user.id, {
      name: item.name,
      description: item.description,
      type: item.type || "weapon",
      rarity: item.rarity || "common",
      image: item.image,
      tokenId: item.tokenId,
      mintedAt: item.mintedAt,
    });

    if (!added) {
      return { success: false, error: "Failed to add item to inventory" };
    }

    // บันทึกกิจกรรมของผู้เล่น
    await addPlayerActivity(
      user.id,
      "receive_nft",
      `ได้รับ NFT "${item.name}"`
    );

    // โหลดข้อมูลล่าสุด
    const {
      success: loadSuccess,
      data: updatedData,
      error: loadError,
    } = await loadGameData(address);

    if (!loadSuccess || !updatedData) {
      return {
        success: false,
        error: loadError || "Failed to load updated data",
      };
    }

    revalidatePath("/");
    return { success: true, data: updatedData };
  } catch (error) {
    console.error("Error receiving NFT item:", error);
    return { success: false, error: "Failed to receive NFT item" };
  }
}

// ฟังก์ชันสำหรับบันทึกประวัติการต่อสู้
export async function recordBattle(address: string, battleData: any) {
  try {
    if (!address) {
      return { success: false, error: "Wallet address is required" };
    }

    // ค้นหาผู้เล่นจากฐานข้อมูล
    const user = await getPlayerData(address);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // บันทึกประวัติการต่อสู้
    const added = await addBattleHistory(user.id, {
      area: user.current_area || "ป่า",
      monstersDefeated: battleData.monstersDefeated || 1,
      coinsEarned: battleData.coinsEarned || 0,
      itemsFound: battleData.itemsFound || 0,
    });

    if (!added) {
      return { success: false, error: "Failed to record battle history" };
    }

    return { success: true };
  } catch (error) {
    console.error("Error recording battle:", error);
    return { success: false, error: "Failed to record battle" };
  }
}
