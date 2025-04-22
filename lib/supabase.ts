import { getSupabaseClient } from "./supabase-client";

// สร้าง Supabase client เมื่อมีการเรียกใช้
export const supabase = {
  get client() {
    try {
      return getSupabaseClient();
    } catch (error) {
      console.error("Error creating Supabase client:", error);
      throw new Error("Failed to create Supabase client");
    }
  },
};

// ฟังก์ชันสำหรับดึงข้อมูลผู้เล่น
export async function getPlayerData(walletAddress: string) {
  try {
    if (!walletAddress) {
      console.error("Wallet address is required");
      return null;
    }

    // ตรวจสอบว่าอยู่ในโหมดจำลองหรือไม่
    if (process.env.NEXT_PUBLIC_SIMULATION_MODE === "true") {
      console.log("[Supabase] Using simulation mode for player data");
      // ใช้ฟังก์ชันจาก simulation-mode.ts
      const {
        generateMockPlayerData,
        getLocalPlayerData,
      } = require("./simulation-mode");

      // ตรวจสอบว่ามีข้อมูลใน localStorage หรือไม่
      const localData = getLocalPlayerData(walletAddress);
      if (localData) {
        return localData;
      }

      // สร้างข้อมูลจำลองใหม่
      return generateMockPlayerData(walletAddress);
    }

    try {
      const { data, error } = await supabase.client
        .from("players")
        .select("*, characters(*), inventory(*), upgrades(*), quests(*)")
        .eq("wallet_address", walletAddress)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error(
          "Error fetching player data:",
          JSON.stringify(error, null, 2)
        );
        if (error.message && error.message.includes("fetch failed")) {
          console.error(
            "[Supabase] Fetch failed. Check your internet connection and Supabase credentials."
          );
          // ใช้ข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
          console.log(
            "[Supabase] Falling back to simulation mode due to fetch error"
          );
          const { generateMockPlayerData } = require("./simulation-mode");
          return generateMockPlayerData(walletAddress);
        }
        return null;
      }

      return data;
    } catch (fetchError) {
      console.error("[Supabase] Fetch operation failed:", fetchError);
      console.log(
        "[Supabase] Falling back to simulation mode due to fetch error"
      );
      const { generateMockPlayerData } = require("./simulation-mode");
      return generateMockPlayerData(walletAddress);
    }
  } catch (error: any) {
    console.error("Error in getPlayerData:", error?.message || error);
    if (error?.message?.includes("fetch failed")) {
      console.error(
        "[Supabase] Fetch failed. Check your internet connection and Supabase credentials."
      );
    }

    // ใช้ข้อมูลจำลองเมื่อเกิดข้อผิดพลาด
    console.log("[Supabase] Falling back to simulation mode due to error");
    const { generateMockPlayerData } = require("./simulation-mode");
    return generateMockPlayerData(walletAddress);
  }
}

// ฟังก์ชันสำหรับสร้างผู้เล่นใหม่
export async function createPlayer(walletAddress: string, initialData: any) {
  try {
    if (!walletAddress) {
      console.error("Wallet address is required");
      return null;
    }

    // ตรวจสอบว่ามีผู้เล่นนี้อยู่แล้วหรือไม่
    const existingPlayer = await getPlayerData(walletAddress);
    if (existingPlayer) {
      console.log("Player already exists:", existingPlayer);
      return existingPlayer;
    }

    // ตรวจสอบว่าอยู่ในโหมดจำลองหรือไม่
    if (process.env.NEXT_PUBLIC_SIMULATION_MODE === "true") {
      console.log("[Supabase] Using simulation mode for player creation");
      const {
        generateMockPlayerData,
        saveLocalPlayerData,
      } = require("./simulation-mode");

      // สร้างข้อมูลจำลองใหม่
      const mockPlayer = generateMockPlayerData(walletAddress);

      // บันทึกข้อมูลลง localStorage
      saveLocalPlayerData(walletAddress, mockPlayer);

      return mockPlayer;
    }

    try {
      // สร้างผู้เล่นใหม่
      const { data: player, error: playerError } = await supabase.client
        .from("players")
        .insert([
          {
            wallet_address: walletAddress,
            coins: initialData.coins || 0,
            damage: initialData.damage || 1,
            auto_damage: initialData.autoDamage || 0,
            current_area: initialData.currentArea || "ป่า",
            level: 1,
            xp: 0,
            xp_required: 100,
          },
        ])
        .select()
        .single();

      if (playerError) {
        console.error("Error creating player:", playerError);
        // ในกรณีที่ไม่สามารถสร้างผู้เล่นได้ ให้ใช้โหมดจำลอง
        console.log(
          "[Supabase] Falling back to simulation mode due to player creation error"
        );
        const {
          generateMockPlayerData,
          saveLocalPlayerData,
        } = require("./simulation-mode");
        const mockPlayer = generateMockPlayerData(walletAddress);
        saveLocalPlayerData(walletAddress, mockPlayer);
        return mockPlayer;
      }

      // ถ้าไม่มี player.id ให้ใช้โหมดจำลอง
      if (!player || !player.id) {
        console.error("Failed to create player: No player ID returned");
        console.log(
          "[Supabase] Falling back to simulation mode due to missing player ID"
        );
        const {
          generateMockPlayerData,
          saveLocalPlayerData,
        } = require("./simulation-mode");
        const mockPlayer = generateMockPlayerData(walletAddress);
        saveLocalPlayerData(walletAddress, mockPlayer);
        return mockPlayer;
      }

      try {
        // สร้างตัวละครเริ่มต้น
        await supabase.client.from("characters").insert([
          {
            player_id: player.id,
            name: "นักผจญภัย",
            level: 1,
            damage: 1,
            image: "/placeholder.svg?height=80&width=80",
          },
        ]);

        // สร้างอัพเกรดเริ่มต้น
        await supabase.client.from("upgrades").insert([
          {
            player_id: player.id,
            auto_battle: false,
            inventory_slots: 10,
            damage_multiplier: 1.0,
          },
        ]);

        // สร้างภารกิจเริ่มต้น
        await supabase.client.from("quests").insert([
          {
            player_id: player.id,
            title: "ล่ามอนสเตอร์",
            description: `สังหารมอนสเตอร์ในพื้นที่ป่า จำนวน 10 ตัว`,
            reward: 50,
            progress: 0,
            target: 10,
            type: "monster",
            completed: false,
            area_required: "ป่า",
          },
          {
            player_id: player.id,
            title: "เก็บสมบัติ",
            description: "เก็บไอเทมจำนวน 3 ชิ้น",
            reward: 100,
            progress: 0,
            target: 3,
            type: "item",
            completed: false,
            area_required: null,
          },
        ]);
      } catch (error) {
        console.error("Error creating initial player data:", error);
        // ถึงแม้จะมีข้อผิดพลาดในการสร้างข้อมูลเริ่มต้น แต่ผู้เล่นถูกสร้างแล้ว
        // จึงส่งข้อมูลผู้เล่นกลับไป
      }

      return player;
    } catch (fetchError) {
      console.error(
        "[Supabase] Fetch operation failed during player creation:",
        fetchError
      );
      console.log(
        "[Supabase] Falling back to simulation mode due to fetch error"
      );
      const {
        generateMockPlayerData,
        saveLocalPlayerData,
      } = require("./simulation-mode");
      const mockPlayer = generateMockPlayerData(walletAddress);
      saveLocalPlayerData(walletAddress, mockPlayer);
      return mockPlayer;
    }
  } catch (error) {
    console.error("Error in createPlayer:", error);
    console.log("[Supabase] Falling back to simulation mode due to error");
    const {
      generateMockPlayerData,
      saveLocalPlayerData,
    } = require("./simulation-mode");
    const mockPlayer = generateMockPlayerData(walletAddress);
    saveLocalPlayerData(walletAddress, mockPlayer);
    return mockPlayer;
  }
}

// ฟังก์ชันสำหรับอัพเดตข้อมูลผู้เล่น
export async function updatePlayerData(playerId: number, data: any) {
  try {
    if (!playerId) {
      console.error("Player ID is required");
      return false;
    }

    const { error } = await supabase.client
      .from("players")
      .update(data)
      .eq("id", playerId);

    if (error) {
      console.error("Error updating player data:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updatePlayerData:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับอัพเดตตัวละคร
export async function updateCharacter(characterId: number, data: any) {
  try {
    if (!characterId) {
      console.error("Character ID is required");
      return false;
    }

    const { error } = await supabase.client
      .from("characters")
      .update(data)
      .eq("id", characterId);

    if (error) {
      console.error("Error updating character:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateCharacter:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับอัพเดตอัพเกรด
export async function updateUpgrades(upgradeId: number, data: any) {
  try {
    if (!upgradeId) {
      console.error("Upgrade ID is required");
      return false;
    }

    const { error } = await supabase.client
      .from("upgrades")
      .update(data)
      .eq("id", upgradeId);

    if (error) {
      console.error("Error updating upgrades:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateUpgrades:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับเพิ่มไอเทมในคลัง
export async function addInventoryItem(playerId: number, item: any) {
  try {
    if (!playerId) {
      console.error("Player ID is required");
      return false;
    }

    const { error } = await supabase.client.from("inventory").insert([
      {
        player_id: playerId,
        name: item.name,
        description: item.description,
        type: item.type,
        rarity: item.rarity,
        image: item.image,
        token_id: item.tokenId,
        minted_at: item.mintedAt ? new Date(item.mintedAt) : new Date(),
      },
    ]);

    if (error) {
      console.error("Error adding inventory item:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addInventoryItem:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับอัพเดตความคืบหน้าของภารกิจ
export async function updateQuestProgress(
  questId: number,
  progress: number,
  completed: boolean
) {
  try {
    if (!questId) {
      console.error("Quest ID is required");
      return false;
    }

    const { error } = await supabase.client
      .from("quests")
      .update({ progress, completed })
      .eq("id", questId);

    if (error) {
      console.error("Error updating quest progress:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in updateQuestProgress:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับเพิ่มประวัติการต่อสู้
export async function addBattleHistory(playerId: number, data: any) {
  try {
    if (!playerId) {
      console.error("Player ID is required");
      return false;
    }

    const { error } = await supabase.client.from("battle_history").insert([
      {
        player_id: playerId,
        area: data.area || "ป่า",
        monsters_defeated: data.monstersDefeated || 0,
        coins_earned: data.coinsEarned || 0,
        items_found: data.itemsFound || 0,
        timestamp: new Date(),
      },
    ]);

    if (error) {
      console.error("Error adding battle history:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addBattleHistory:", error);
    return false;
  }
}

// ฟังก์ชันสำหรับเพิ่มกิจกรรมของผู้เล่น
export async function addPlayerActivity(
  playerId: number,
  activityType: string,
  description: string
) {
  try {
    if (!playerId) {
      console.error("Player ID is required");
      return false;
    }

    const { error } = await supabase.client.from("player_activities").insert([
      {
        player_id: playerId,
        activity_type: activityType,
        description: description,
        timestamp: new Date(),
      },
    ]);

    if (error) {
      console.error("Error adding player activity:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in addPlayerActivity:", error);
    return false;
  }
}
