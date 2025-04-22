// simulation-mode.ts
// ไฟล์นี้จัดการเกี่ยวกับโหมดจำลองสำหรับเมื่อไม่มีการเชื่อมต่อกับบล็อกเชนจริง

import { ethers } from "ethers";

// ต่อไปนี้คือ interfaces สำหรับกำหนด type ให้ฟังก์ชัน
export interface LevelUpResult {
  isLevelUp: boolean;
  rewards: {
    coins: number;
    items: any[];
  };
  player: any;
}

export interface InventoryItem {
  id: number;
  name: string;
  description: string;
  itemType: string;
  rarity: string;
  power: number;
  price?: number;
  area?: string;
  dropRate?: number;
  tokenId?: string;
  image?: string;
  upgradeLevel?: number;
}

export interface AttackResult {
  damage: number;
  defeated: boolean;
  reward: number;
  experience: number;
  itemDropped: boolean;
  item: InventoryItem | null;
  levelUp: boolean;
  updatedPlayer: any;
  isCriticalHit?: boolean;
  comboCounter?: number;
}

export interface MintNFTResult {
  success: boolean;
  tokenId: number;
  item: InventoryItem;
  txHash: string;
}

// เพิ่ม Interface สำหรับระบบสกิล
export interface Skill {
  id: number;
  name: string;
  description: string;
  type: 'passive' | 'active';
  effect: {
    target: 'damage' | 'critChance' | 'dropRate' | 'experience' | 'coins' | 'defense';
    value: number;
  };
  level: number;
  maxLevel: number;
  cost: number;
}

// สกิลทั้งหมดในเกม
export const AVAILABLE_SKILLS: Skill[] = [
  {
    id: 1,
    name: "พลังโจมตี",
    description: "เพิ่มความเสียหายพื้นฐาน",
    type: 'passive',
    effect: {
      target: 'damage',
      value: 2 // เพิ่มดาเมจ 2 หน่วยต่อเลเวลสกิล
    },
    level: 0,
    maxLevel: 10,
    cost: 100
  },
  {
    id: 2,
    name: "โชคชะตา",
    description: "เพิ่มโอกาสในการได้รับไอเทม",
    type: 'passive',
    effect: {
      target: 'dropRate',
      value: 0.05 // เพิ่มโอกาสดรอป 5% ต่อเลเวลสกิล
    },
    level: 0,
    maxLevel: 5,
    cost: 150
  },
  {
    id: 3,
    name: "คมดาบ",
    description: "เพิ่มโอกาสคริติคอล",
    type: 'passive',
    effect: {
      target: 'critChance',
      value: 0.03 // เพิ่มโอกาสคริติคอล 3% ต่อเลเวลสกิล
    },
    level: 0,
    maxLevel: 5,
    cost: 200
  },
  {
    id: 4,
    name: "ปราชญ์",
    description: "เพิ่มประสบการณ์ที่ได้รับ",
    type: 'passive',
    effect: {
      target: 'experience',
      value: 0.1 // เพิ่มประสบการณ์ 10% ต่อเลเวลสกิล
    },
    level: 0,
    maxLevel: 5,
    cost: 250
  },
  {
    id: 5,
    name: "ตะกละ",
    description: "เพิ่มเหรียญที่ได้รับ",
    type: 'passive',
    effect: {
      target: 'coins',
      value: 0.1 // เพิ่มเหรียญ 10% ต่อเลเวลสกิล
    },
    level: 0,
    maxLevel: 5,
    cost: 200
  }
];

// ตรวจสอบว่าแอปพลิเคชันอยู่ในโหมดจำลองหรือไม่
export const isSimulationMode = () => {
  // ตรวจสอบจาก environment variable
  if (typeof process !== "undefined") {
    return process.env.NEXT_PUBLIC_SIMULATION_MODE === "true";
  }
  
  // ถ้าไม่มีค่า environment variable ให้ตรวจสอบจาก localStorage
  if (typeof window !== "undefined") {
    const simulationMode = localStorage.getItem("simulation_mode");
    if (simulationMode !== null) {
      return simulationMode === "true";
    }
  }
  
  // ค่าเริ่มต้นเป็น false
  return false;
};

// ตั้งค่าโหมดจำลอง
export const setSimulationMode = (enabled: boolean) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("simulation_mode", enabled ? "true" : "false");
  }
};

// ดึงข้อมูลผู้เล่นจาก localStorage
export const getLocalPlayerData = (address: string) => {
  if (typeof window !== "undefined") {
    const playerData = localStorage.getItem(`player_${address}`);
    if (playerData) {
      return JSON.parse(playerData);
    }
  }
  return null;
};

// บันทึกข้อมูลผู้เล่นลง localStorage
export const saveLocalPlayerData = (address: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(`player_${address}`, JSON.stringify(data));
  }
};

// สร้าง Mock Data สำหรับผู้เล่น
export const generateMockPlayerData = (address: string) => {
  // ตรวจสอบว่ามีข้อมูลในlocal storage หรือไม่
  const existingData = getLocalPlayerData(address);
  if (existingData) {
    return existingData;
  }
  
  // สร้างข้อมูลใหม่หากไม่มีในlocal storage
  const newPlayerData = {
    address,
    coins: 100,
    damage: 5,
    autoDamage: 1,
    monstersDefeated: 5,
    currentArea: "ป่า",
    lastAttackTime: Date.now() - 300000, // 5 นาทีที่แล้ว
    level: 1,
    experience: 0,
    experienceRequired: 100,
    characters: [
      {
        id: 1,
        name: "นักผจญภัย",
        level: 1,
        damage: 5,
        defense: 2,
        cost: 0,
        experience: 0,
        experienceRequired: 100
      }
    ],
    inventory: [],
    quests: [
      {
        id: 1,
        title: "เริ่มการผจญภัย",
        description: "เอาชนะมอนสเตอร์ 5 ตัว",
        reward: 50,
        progress: 0,
        target: 5,
        completed: false
      }
    ],
    achievements: [
      {
        id: 1,
        title: "นักล่ามือใหม่",
        description: "เอาชนะมอนสเตอร์ครั้งแรก",
        progress: 0,
        target: 1,
        completed: false,
        reward: "10 ADVT"
      }
    ],
    skills: AVAILABLE_SKILLS.map(skill => ({ ...skill })), // เพิ่มสกิลเริ่มต้น
    comboCounter: 0,
    lastAttackedMonsterId: null,
    exists: true,
    stats: {
      totalDamageDealt: 0,
      criticalHits: 0,
      longestCombo: 0,
      itemsFound: 0,
      totalCoinsEarned: 0
    }
  };
  
  // บันทึกข้อมูลลง localStorage
  saveLocalPlayerData(address, newPlayerData);
  
  return newPlayerData;
};

// ไอเทมที่สามารถพบได้ในเกม
export const MOCK_ITEMS = [
  // พื้นที่: ป่า
  {
    id: 1,
    name: "ดาบไม้",
    description: "ดาบพื้นฐานที่ทำจากไม้",
    itemType: "weapon",
    rarity: "common",
    power: 2,
    price: 50,
    area: "ป่า",
    dropRate: 0.2
  },
  {
    id: 2,
    name: "หมวกหนัง",
    description: "หมวกที่ทำจากหนังสัตว์",
    itemType: "armor",
    rarity: "common",
    power: 1,
    price: 30,
    area: "ป่า",
    dropRate: 0.3
  },
  {
    id: 3,
    name: "รองเท้าหนัง",
    description: "รองเท้าที่ทำจากหนังสัตว์",
    itemType: "armor",
    rarity: "common",
    power: 1,
    price: 25,
    area: "ป่า",
    dropRate: 0.25
  },
  {
    id: 4,
    name: "แหวนพลังป่า",
    description: "แหวนที่เพิ่มพลังชีวิต",
    itemType: "accessory",
    rarity: "uncommon",
    power: 3,
    price: 80,
    area: "ป่า",
    dropRate: 0.1
  },
  // พื้นที่: ถ้ำ
  {
    id: 5,
    name: "ดาบเหล็ก",
    description: "ดาบที่ทำจากเหล็กกล้า",
    itemType: "weapon",
    rarity: "uncommon",
    power: 5,
    price: 120,
    area: "ถ้ำ",
    dropRate: 0.15
  },
  {
    id: 6,
    name: "เสื้อเกราะหนัง",
    description: "เสื้อเกราะที่ทำจากหนังสัตว์อย่างดี",
    itemType: "armor",
    rarity: "uncommon",
    power: 3,
    price: 100,
    area: "ถ้ำ",
    dropRate: 0.2
  },
  {
    id: 7,
    name: "พลอยวิเศษ",
    description: "พลอยที่เก็บพลังงานเวทย์ได้",
    itemType: "gem",
    rarity: "rare",
    power: 8,
    price: 200,
    area: "ถ้ำ",
    dropRate: 0.05
  },
  {
    id: 8,
    name: "หมวกเหล็ก",
    description: "หมวกที่ทำจากเหล็กแข็งแรง",
    itemType: "armor",
    rarity: "uncommon",
    power: 4,
    price: 90,
    area: "ถ้ำ",
    dropRate: 0.15
  },
  // พื้นที่: ทะเลทราย (เพิ่มใหม่)
  {
    id: 9,
    name: "กริชทราย",
    description: "อาวุธที่ถูกหล่อด้วยทรายวิเศษ",
    itemType: "weapon",
    rarity: "rare",
    power: 10,
    price: 250,
    area: "ทะเลทราย",
    dropRate: 0.12
  },
  {
    id: 10,
    name: "เสื้อผ้าทะเลทราย",
    description: "เครื่องแต่งกายที่ป้องกันความร้อนได้ดี",
    itemType: "armor",
    rarity: "rare",
    power: 7,
    price: 220,
    area: "ทะเลทราย",
    dropRate: 0.15
  },
  {
    id: 11,
    name: "ผ้าคลุมทะเลทราย",
    description: "ผ้าคลุมที่ช่วยป้องกันพายุทราย",
    itemType: "armor",
    rarity: "uncommon",
    power: 5,
    price: 150,
    area: "ทะเลทราย",
    dropRate: 0.2
  },
  {
    id: 12,
    name: "อัญมณีทราย",
    description: "อัญมณีหายากที่พบในทะเลทราย",
    itemType: "gem",
    rarity: "epic",
    power: 12,
    price: 400,
    area: "ทะเลทราย",
    dropRate: 0.05
  },
  // พื้นที่: ภูเขาไฟ (เพิ่มใหม่)
  {
    id: 13,
    name: "ดาบเพลิง",
    description: "ดาบที่ถูกหลอมด้วยลาวาจากภูเขาไฟ",
    itemType: "weapon",
    rarity: "epic",
    power: 15,
    price: 500,
    area: "ภูเขาไฟ",
    dropRate: 0.1
  },
  {
    id: 14,
    name: "เสื้อเกราะเพลิง",
    description: "เสื้อเกราะที่ทนความร้อนสูง",
    itemType: "armor",
    rarity: "epic",
    power: 12,
    price: 450,
    area: "ภูเขาไฟ",
    dropRate: 0.12
  },
  {
    id: 15,
    name: "หินลาวา",
    description: "หินที่ยังร้อนระอุจากลาวา",
    itemType: "material",
    rarity: "rare",
    power: 0,
    price: 300,
    area: "ภูเขาไฟ",
    dropRate: 0.2
  },
  {
    id: 16,
    name: "มงกุฎเพลิง",
    description: "มงกุฎที่เพิ่มพลังโจมตีอย่างมหาศาล",
    itemType: "accessory",
    rarity: "legendary",
    power: 20,
    price: 1000,
    area: "ภูเขาไฟ",
    dropRate: 0.03
  }
];

// สร้าง Mock Monster Data
export const generateMockMonsterData = (area: string) => {
  const monsters = [
    // พื้นที่: ป่า
    {
      id: 1,
      name: "สไลม์",
      hp: 10,
      maxHp: 10,
      reward: 5,
      monsterType: "slime",
      area: "ป่า",
      experience: 5,
      dropChance: 0.1,
      resistance: 0
    },
    {
      id: 2,
      name: "โกเบลิน",
      hp: 20,
      maxHp: 20,
      reward: 10,
      monsterType: "goblin",
      area: "ป่า",
      experience: 10,
      dropChance: 0.15,
      resistance: 1
    },
    {
      id: 3,
      name: "หมาป่า",
      hp: 30,
      maxHp: 30,
      reward: 15,
      monsterType: "wolf",
      area: "ป่า",
      experience: 15,
      dropChance: 0.2,
      resistance: 2
    },
    // พื้นที่: ถ้ำ
    {
      id: 4,
      name: "ซอมบี้",
      hp: 40,
      maxHp: 40,
      reward: 20,
      monsterType: "zombie",
      area: "ถ้ำ",
      experience: 20,
      dropChance: 0.25,
      resistance: 3
    },
    {
      id: 5,
      name: "โครงกระดูก",
      hp: 50,
      maxHp: 50,
      reward: 25,
      monsterType: "skeleton",
      area: "ถ้ำ",
      experience: 25,
      dropChance: 0.3,
      resistance: 4
    },
    {
      id: 6,
      name: "มังกรน้อย",
      hp: 100,
      maxHp: 100,
      reward: 50,
      monsterType: "dragon",
      area: "ถ้ำ",
      experience: 50,
      dropChance: 0.4,
      isBoss: true,
      resistance: 8
    },
    // พื้นที่: ทะเลทราย (เพิ่มใหม่)
    {
      id: 7,
      name: "แมงป่องยักษ์",
      hp: 70,
      maxHp: 70,
      reward: 35,
      monsterType: "scorpion",
      area: "ทะเลทราย",
      experience: 35,
      dropChance: 0.25,
      resistance: 5
    },
    {
      id: 8,
      name: "มัมมี่",
      hp: 90,
      maxHp: 90,
      reward: 45,
      monsterType: "mummy",
      area: "ทะเลทราย",
      experience: 45,
      dropChance: 0.3,
      resistance: 7
    },
    {
      id: 9,
      name: "ทรายมีชีวิต",
      hp: 120,
      maxHp: 120,
      reward: 60,
      monsterType: "sandmonster",
      area: "ทะเลทราย",
      experience: 60,
      dropChance: 0.35,
      isBoss: true,
      resistance: 10
    },
    // พื้นที่: ภูเขาไฟ (เพิ่มใหม่)
    {
      id: 10,
      name: "หินหลอมเหลว",
      hp: 100,
      maxHp: 100,
      reward: 50,
      monsterType: "magma",
      area: "ภูเขาไฟ",
      experience: 50,
      dropChance: 0.25,
      resistance: 8
    },
    {
      id: 11,
      name: "ปีศาจไฟ",
      hp: 150,
      maxHp: 150,
      reward: 75,
      monsterType: "firefiend",
      area: "ภูเขาไฟ",
      experience: 75,
      dropChance: 0.3,
      resistance: 12
    },
    {
      id: 12,
      name: "มังกรเพลิง",
      hp: 300,
      maxHp: 300,
      reward: 150,
      monsterType: "firedragon",
      area: "ภูเขาไฟ",
      experience: 150,
      dropChance: 0.4,
      isBoss: true,
      resistance: 20
    }
  ];
  
  // กรองมอนสเตอร์ตามพื้นที่
  return monsters.filter(monster => monster.area === area);
};

// สร้าง object สำหรับเก็บมอนสเตอร์แยกตามพื้นที่
export const MOCK_MONSTERS = {
  "ป่า": generateMockMonsterData("ป่า"),
  "ถ้ำ": generateMockMonsterData("ถ้ำ"),
  "ทะเลทราย": generateMockMonsterData("ทะเลทราย"),
  "ภูเขาไฟ": generateMockMonsterData("ภูเขาไฟ")
};

// ตรวจสอบการอัพเลเวลของผู้เล่น
export const checkLevelUp = (player: any): LevelUpResult => {
  let isLevelUp = false;
  let rewards: {
    coins: number;
    items: any[];
  } = { 
    coins: 0, 
    items: []
  };
  
  // ตรวจสอบว่าประสบการณ์ถึงเกณฑ์อัพเลเวลหรือไม่
  if (player.experience >= player.experienceRequired) {
    player.level += 1;
    player.experience -= player.experienceRequired;
    player.experienceRequired = player.level * 100; // เพิ่มค่าประสบการณ์ที่ต้องการตามเลเวล
    player.damage += 2; // เพิ่มพลังโจมตีเมื่ออัพเลเวล
    
    // รางวัลเมื่ออัพเลเวล
    rewards.coins = player.level * 25;
    player.coins += rewards.coins;
    
    isLevelUp = true;
    
    // บันทึกข้อมูลผู้เล่นที่อัพเดต
    saveLocalPlayerData(player.address, player);
  }
  
  return { isLevelUp, rewards, player };
};

// Interface สำหรับบันทึกการต่อสู้
export interface BattleLogEntry {
  timestamp: number;
  monsterId: number;
  monsterName: string;
  damage: number;
  isCriticalHit: boolean;
  comboCount: number;
  reward: number;
  experience: number;
  itemDropped?: {
    id: number;
    name: string;
    rarity: string;
  };
  area: string;
  playerLevel: number;
}

// บันทึกการต่อสู้ลงในประวัติ
export const logBattle = (playerData: any, battleResult: AttackResult, monster: any): void => {
  if (!playerData.battleLog) {
    playerData.battleLog = [];
  }

  // สร้างบันทึกการต่อสู้ใหม่
  const logEntry: BattleLogEntry = {
    timestamp: Date.now(),
    monsterId: monster.id,
    monsterName: monster.name,
    damage: battleResult.damage,
    isCriticalHit: battleResult.isCriticalHit || false,
    comboCount: battleResult.comboCounter || 0,
    reward: battleResult.reward,
    experience: battleResult.experience,
    area: monster.area,
    playerLevel: playerData.level
  };

  // เพิ่มข้อมูลไอเทมถ้าได้รับ
  if (battleResult.itemDropped && battleResult.item) {
    logEntry.itemDropped = {
      id: battleResult.item.id,
      name: battleResult.item.name,
      rarity: battleResult.item.rarity
    };
  }

  // เก็บบันทึกล่าสุดไว้สูงสุด 100 รายการ
  playerData.battleLog.unshift(logEntry);
  if (playerData.battleLog.length > 100) {
    playerData.battleLog = playerData.battleLog.slice(0, 100);
  }

  // บันทึกข้อมูล
  saveLocalPlayerData(playerData.address, playerData);
};

// ระบบการอัพเกรดไอเทม
export const upgradeItem = (itemId: number, playerData: any) => {
  // ค้นหาไอเทมในกระเป๋า
  const itemIndex = playerData.inventory.findIndex((item: InventoryItem) => item.id === itemId);
  if (itemIndex === -1) {
    return { success: false, error: "Item not found" };
  }

  const item = playerData.inventory[itemIndex];
  
  // ถ้าไอเทมไม่มีระดับอัพเกรด ให้เพิ่มค่าเริ่มต้น
  if (item.upgradeLevel === undefined) {
    item.upgradeLevel = 0;
  }
  
  // จำกัดระดับการอัพเกรดตามความหายาก
  const maxUpgradeLevel = getMaxUpgradeLevel(item.rarity);
  
  if (item.upgradeLevel >= maxUpgradeLevel) {
    return { success: false, error: "Item already at max upgrade level" };
  }
  
  // คำนวณค่าใช้จ่ายในการอัพเกรด
  const upgradeCost = calculateUpgradeCost(item);
  
  // ตรวจสอบว่ามีเหรียญพอหรือไม่
  if (playerData.coins < upgradeCost) {
    return { success: false, error: "Not enough coins" };
  }
  
  // หักเหรียญ
  playerData.coins -= upgradeCost;
  
  // โอกาสในการอัพเกรดสำเร็จ
  const upgradeChance = calculateUpgradeChance(item);
  const upgradeSuccess = Math.random() < upgradeChance;
  
  if (upgradeSuccess) {
    // อัพเกรดสำเร็จ
    item.upgradeLevel += 1;
    
    // เพิ่มพลังให้ไอเทม
    const powerIncrease = Math.floor(item.power * 0.2); // เพิ่ม 20% ของพลังเดิม
    item.power += powerIncrease;
    
    // อัพเดตชื่อให้แสดงระดับอัพเกรด
    item.name = updateItemNameWithUpgradeLevel(item);
    
    // บันทึกข้อมูล
    playerData.inventory[itemIndex] = item;
    saveLocalPlayerData(playerData.address, playerData);
    
    return {
      success: true,
      updatedItem: item,
      upgradeLevel: item.upgradeLevel,
      powerIncrease,
      updatedPlayer: playerData
    };
  } else {
    // อัพเกรดล้มเหลว - ไม่ต้องคืนเหรียญ
    return {
      success: false,
      error: "Upgrade failed",
      lostCoins: upgradeCost,
      updatedPlayer: playerData
    };
  }
};

// คำนวณระดับอัพเกรดสูงสุดตามความหายาก
const getMaxUpgradeLevel = (rarity: string): number => {
  switch (rarity) {
    case 'common': return 5;
    case 'uncommon': return 8;
    case 'rare': return 10;
    case 'epic': return 15;
    case 'legendary': return 20;
    default: return 5;
  }
};

// คำนวณค่าใช้จ่ายในการอัพเกรด
const calculateUpgradeCost = (item: InventoryItem): number => {
  const basePrice = item.price || 100;
  const upgradeLevel = item.upgradeLevel || 0;
  
  // ราคาเพิ่มขึ้นตามระดับอัพเกรด
  return Math.floor(basePrice * (1 + upgradeLevel * 0.5));
};

// คำนวณโอกาสในการอัพเกรดสำเร็จ
const calculateUpgradeChance = (item: InventoryItem): number => {
  const upgradeLevel = item.upgradeLevel || 0;
  
  // โอกาสลดลงตามระดับอัพเกรด
  let chance = 0.95 - (upgradeLevel * 0.05);
  
  // ปรับแต่งโอกาสตามความหายากของไอเทม
  switch (item.rarity) {
    case 'common': chance += 0.1; break;
    case 'uncommon': chance += 0.05; break;
    case 'rare': break; // ใช้ค่าเดิม
    case 'epic': chance -= 0.05; break;
    case 'legendary': chance -= 0.1; break;
  }
  
  // จำกัดค่าระหว่าง 0.1 - 1.0
  return Math.max(0.1, Math.min(1.0, chance));
};

// อัพเดตชื่อไอเทมเพื่อแสดงระดับอัพเกรด
const updateItemNameWithUpgradeLevel = (item: InventoryItem): string => {
  // แยกชื่อไอเทมเดิมออกจากเครื่องหมาย +
  const baseName = item.name.split(' +')[0];
  
  if (item.upgradeLevel && item.upgradeLevel > 0) {
    return `${baseName} +${item.upgradeLevel}`;
  }
  
  return baseName;
};

// จำลองการโจมตีมอนสเตอร์
export const simulateAttack = (monsterId: number, playerData: any): AttackResult => {
  // ค้นหามอนสเตอร์จาก ID
  const monsters = [
    ...generateMockMonsterData("ป่า"),
    ...generateMockMonsterData("ถ้ำ"),
    ...generateMockMonsterData("ทะเลทราย"),
    ...generateMockMonsterData("ภูเขาไฟ")
  ];
  const monster = monsters.find(m => m.id === monsterId);
  
  if (!monster) {
    return {
      damage: 0,
      defeated: false,
      reward: 0,
      experience: 0,
      itemDropped: false,
      item: null,
      levelUp: false,
      updatedPlayer: playerData,
      isCriticalHit: false,
      comboCounter: 0
    };
  }
  
  // คำนวณโบนัสจากสกิล
  const damageBonus = calculateBonusFromSkills(playerData, 'damage');
  const critChanceBonus = calculateBonusFromSkills(playerData, 'critChance');
  const dropRateBonus = calculateBonusFromSkills(playerData, 'dropRate');
  const experienceBonus = calculateBonusFromSkills(playerData, 'experience');
  const coinsBonus = calculateBonusFromSkills(playerData, 'coins');
  
  // ระบบ Critical Hit (โอกาส 10% ต่อเลเวลของผู้เล่น แต่ไม่เกิน 25%) + โบนัสจากสกิล
  const criticalChance = Math.min(0.1 + (playerData.level * 0.01) + critChanceBonus, 0.5);
  const isCriticalHit = Math.random() < criticalChance;
  
  // คำนวณความเสียหาย (เพิ่มความสุ่ม) + โบนัสจากสกิล
  let damage = playerData.damage + damageBonus + Math.floor(Math.random() * 3);
  
  // เพิ่มความเสียหายเป็น 2 เท่าถ้าเป็น Critical Hit
  if (isCriticalHit) {
    damage = Math.floor(damage * 2);
    // เพิ่มสถิติคริติคอล
    playerData.stats.criticalHits = (playerData.stats.criticalHits || 0) + 1;
  }
  
  // ระบบ Combo (เพิ่มขึ้นทุกครั้งที่โจมตี และรีเซ็ตเมื่อมอนสเตอร์ตาย)
  let comboCounter = playerData.comboCounter || 0;
  if (!playerData.lastAttackedMonsterId || playerData.lastAttackedMonsterId === monsterId) {
    comboCounter += 1;
    
    // บันทึกคอมโบที่ยาวที่สุด
    if (comboCounter > (playerData.stats.longestCombo || 0)) {
      playerData.stats.longestCombo = comboCounter;
    }
    
    // เพิ่มความเสียหายตาม combo (เพิ่ม 5% ต่อ combo แต่ไม่เกิน 50%)
    const comboBonus = Math.min(comboCounter * 0.05, 0.5);
    damage = Math.floor(damage * (1 + comboBonus));
  } else {
    // รีเซ็ต combo เมื่อเปลี่ยนเป้าหมาย
    comboCounter = 1;
  }
  
  const defeated = damage >= monster.hp;
  
  // คำนวณรางวัลเหรียญ + โบนัสจากสกิล
  const baseReward = defeated ? monster.reward : 0;
  const reward = Math.floor(baseReward * (1 + coinsBonus));
  
  // เพิ่มสถิติความเสียหายทั้งหมด
  playerData.stats.totalDamageDealt = (playerData.stats.totalDamageDealt || 0) + damage;
  
  // อัพเดตข้อมูล combo
  playerData.comboCounter = defeated ? 0 : comboCounter;
  playerData.lastAttackedMonsterId = monsterId;
  
  let result: AttackResult = {
    damage,
    defeated,
    reward,
    experience: defeated ? monster.experience : 0,
    itemDropped: false,
    item: null,
    levelUp: false,
    updatedPlayer: playerData,
    isCriticalHit,
    comboCounter
  };
  
  if (defeated) {
    // อัพเดตข้อมูลผู้เล่น
    playerData.coins += reward;
    // เพิ่มสถิติเหรียญที่ได้รับทั้งหมด
    playerData.stats.totalCoinsEarned = (playerData.stats.totalCoinsEarned || 0) + reward;
    
    // เพิ่มประสบการณ์ตามปกติ + โบนัสจาก Critical Hit + โบนัสจากสกิล
    const baseExperience = monster.experience;
    const criticalBonus = isCriticalHit ? 0.2 : 0;
    const totalExperience = Math.floor(baseExperience * (1 + criticalBonus + experienceBonus));
    
    playerData.experience += totalExperience;
    playerData.monstersDefeated += 1;
    result.experience = totalExperience;
    
    // ตรวจสอบความคืบหน้าของเควส
    playerData.quests = playerData.quests.map((quest: any) => {
      if (quest.completed) return quest;
      
      if (quest.id === 1) { // เควสเอาชนะมอนสเตอร์
        quest.progress += 1;
        if (quest.progress >= quest.target) {
          quest.completed = true;
          playerData.coins += quest.reward;
          playerData.stats.totalCoinsEarned = (playerData.stats.totalCoinsEarned || 0) + quest.reward;
        }
      }
      
      return quest;
    });
    
    // อัพเดตเควสประจำวัน
    if (playerData.dailyQuests) {
      updateDailyQuestProgress(playerData, 'kill');
    }
    
    // ตรวจสอบความคืบหน้าของความสำเร็จ
    playerData.achievements = playerData.achievements.map((achievement: any) => {
      if (achievement.completed) return achievement;
      
      if (achievement.id === 1) { // ความสำเร็จในการเอาชนะมอนสเตอร์ครั้งแรก
        achievement.progress = 1;
        achievement.completed = true;
      }
      
      return achievement;
    });
    
    // โอกาสในการได้รับไอเทม (เพิ่มโอกาสอีก 10% ถ้าเป็น Critical Hit) + โบนัสจากสกิล
    const baseDropChance = monster.dropChance;
    const criticalDropBonus = isCriticalHit ? 0.1 : 0;
    const totalDropChance = baseDropChance + criticalDropBonus + dropRateBonus;
    
    if (Math.random() < totalDropChance) {
      // กรองไอเทมตามพื้นที่
      const areaItems = MOCK_ITEMS.filter(item => item.area === monster.area);
      
      if (areaItems.length > 0) {
        // เลือกไอเทมตามโอกาสในการดรอป
        const totalDropRate = areaItems.reduce((sum, item) => sum + item.dropRate, 0);
        let randomValue = Math.random() * totalDropRate;
        
        for (const item of areaItems) {
          randomValue -= item.dropRate;
          if (randomValue <= 0) {
            // สร้างไอเทมใหม่ด้วย ID ที่ไม่ซ้ำกัน
            const inventoryItem: InventoryItem = {
              ...item,
              id: Date.now() + Math.floor(Math.random() * 1000),
              upgradeLevel: 0
            };
            
            // เพิ่มไอเทมลงในกระเป๋า
            playerData.inventory.push(inventoryItem);
            result.itemDropped = true;
            result.item = inventoryItem;
            
            // เพิ่มสถิติไอเทมที่พบ
            playerData.stats.itemsFound = (playerData.stats.itemsFound || 0) + 1;
            
            // อัพเดตเควสประจำวัน
            if (playerData.dailyQuests) {
              updateDailyQuestProgress(playerData, 'collect');
            }
            break;
          }
        }
      }
    }
    
    // ตรวจสอบการอัพเลเวล
    const levelUpResult = checkLevelUp(playerData);
    if (levelUpResult.isLevelUp) {
      result.levelUp = true;
    }
    
    // บันทึกประวัติการต่อสู้
    logBattle(playerData, result, monster);
    
    // บันทึกข้อมูลที่อัพเดตลง localStorage
    saveLocalPlayerData(playerData.address, playerData);
    result.updatedPlayer = playerData;
  }
  
  return result;
};

// สร้างเควสประจำวัน
export interface DailyQuest {
  id: number;
  title: string;
  description: string;
  type: 'kill' | 'collect' | 'upgrade' | 'visit';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    coins: number;
    experience: number;
    items?: InventoryItem[];
  };
  expiresAt: number; // เวลาหมดอายุ (timestamp)
}

// ชุดเควสประจำวันที่เป็นไปได้
export const DAILY_QUEST_TEMPLATES = [
  {
    title: "นักล่ามอนสเตอร์",
    description: "เอาชนะมอนสเตอร์ {target} ตัว",
    type: 'kill',
    targetRange: [5, 15],
    rewardCoins: [50, 150],
    rewardExp: [20, 50]
  },
  {
    title: "นักสะสม",
    description: "เก็บไอเทม {target} ชิ้น",
    type: 'collect',
    targetRange: [2, 5],
    rewardCoins: [100, 200],
    rewardExp: [30, 60]
  },
  {
    title: "ช่างฝีมือ",
    description: "อัพเกรดตัวละคร {target} ครั้ง",
    type: 'upgrade',
    targetRange: [1, 3],
    rewardCoins: [150, 300],
    rewardExp: [40, 80]
  },
  {
    title: "นักสำรวจ",
    description: "เยี่ยมชมพื้นที่ {target} แห่ง",
    type: 'visit',
    targetRange: [2, 4],
    rewardCoins: [100, 250],
    rewardExp: [30, 70]
  }
];

// สร้างเควสประจำวันใหม่
export const generateDailyQuests = (count = 3): DailyQuest[] => {
  const quests: DailyQuest[] = [];
  const usedTemplates = new Set<number>();
  
  for (let i = 0; i < count; i++) {
    // เลือกเทมเพลตเควสที่ยังไม่ถูกใช้
    let templateIndex;
    do {
      templateIndex = Math.floor(Math.random() * DAILY_QUEST_TEMPLATES.length);
    } while (usedTemplates.has(templateIndex) && usedTemplates.size < DAILY_QUEST_TEMPLATES.length);
    
    usedTemplates.add(templateIndex);
    const template = DAILY_QUEST_TEMPLATES[templateIndex];
    
    // สุ่มค่าเป้าหมายและรางวัล
    const targetRange = template.targetRange;
    const target = Math.floor(Math.random() * (targetRange[1] - targetRange[0] + 1)) + targetRange[0];
    
    const rewardCoinsRange = template.rewardCoins;
    const rewardCoins = Math.floor(Math.random() * (rewardCoinsRange[1] - rewardCoinsRange[0] + 1)) + rewardCoinsRange[0];
    
    const rewardExpRange = template.rewardExp;
    const rewardExp = Math.floor(Math.random() * (rewardExpRange[1] - rewardExpRange[0] + 1)) + rewardExpRange[0];
    
    // สร้างเควสใหม่
    const quest: DailyQuest = {
      id: Date.now() + i,
      title: template.title,
      description: template.description.replace('{target}', target.toString()),
      type: template.type as 'kill' | 'collect' | 'upgrade' | 'visit',
      target,
      progress: 0,
      completed: false,
      reward: {
        coins: rewardCoins,
        experience: rewardExp
      },
      // เควสหมดอายุในวันถัดไป (ตอน 0:00 น.)
      expiresAt: new Date(new Date().setHours(24, 0, 0, 0)).getTime()
    };
    
    quests.push(quest);
  }
  
  return quests;
};

// อัพเดตความคืบหน้าของเควสประจำวัน
export const updateDailyQuestProgress = (playerData: any, type: string, count = 1): void => {
  if (!playerData.dailyQuests) return;
  
  // หาเควสที่ยังไม่สำเร็จและตรงกับประเภทที่ระบุ
  playerData.dailyQuests = playerData.dailyQuests.map((quest: DailyQuest) => {
    if (!quest.completed && quest.type === type) {
      quest.progress += count;
      
      // ตรวจสอบว่าสำเร็จหรือยัง
      if (quest.progress >= quest.target) {
        quest.completed = true;
        
        // ให้รางวัล
        playerData.coins += quest.reward.coins;
        playerData.experience += quest.reward.experience;
        
        // เพิ่มสถิติเหรียญที่ได้รับทั้งหมด
        playerData.stats.totalCoinsEarned = (playerData.stats.totalCoinsEarned || 0) + quest.reward.coins;
        
        // เพิ่มไอเทมรางวัล (ถ้ามี)
        if (quest.reward.items && quest.reward.items.length > 0) {
          playerData.inventory = [...playerData.inventory, ...quest.reward.items];
        }
      }
    }
    return quest;
  });
  
  // บันทึกข้อมูลที่อัพเดต
  saveLocalPlayerData(playerData.address, playerData);
};

// ตรวจสอบและรีเซ็ตเควสประจำวัน
export const checkAndResetDailyQuests = (playerData: any): any => {
  const now = Date.now();
  
  // ถ้ายังไม่มีเควสประจำวัน หรือมีเควสที่หมดอายุแล้ว
  if (!playerData.dailyQuests || 
      !playerData.dailyQuests.length || 
      playerData.dailyQuests.some((q: DailyQuest) => q.expiresAt < now)) {
    // สร้างเควสใหม่
    playerData.dailyQuests = generateDailyQuests();
    // บันทึกข้อมูล
    saveLocalPlayerData(playerData.address, playerData);
  }
  
  return playerData;
};

// จำลองการอัพเกรดตัวละคร
export const simulateCharacterUpgrade = (characterId: number, playerData: any) => {
  // ค้นหาตัวละคร
  const character = playerData.characters.find((c: any) => c.id === characterId);
  if (!character) {
    return { success: false, error: "Character not found" };
  }
  
  // คำนวณค่าใช้จ่ายในการอัพเกรด
  const upgradeCost = character.level * 25;
  
  // ตรวจสอบว่ามีเหรียญพอหรือไม่
  if (playerData.coins < upgradeCost) {
    return { success: false, error: "Not enough coins" };
  }
  
  // หักเหรียญ
  playerData.coins -= upgradeCost;
  
  // อัพเกรดตัวละคร
  character.level += 1;
  character.damage += 2;
  character.defense += 1;
  character.experienceRequired = character.level * 100;
  
  // อัพเดตพลังโจมตีของผู้เล่น
  playerData.damage += 2;
  
  // อัพเดตเควสประจำวัน
  if (playerData.dailyQuests) {
    updateDailyQuestProgress(playerData, 'upgrade');
  }
  
  // บันทึกข้อมูลที่อัพเดตลง localStorage
  saveLocalPlayerData(playerData.address, playerData);
  
  return {
    success: true,
    newLevel: character.level,
    cost: upgradeCost,
    updatedPlayer: playerData
  };
};

// จำลองการซื้อตัวละครใหม่
export const simulateBuyCharacter = (characterType: string, playerData: any) => {
  // ตัวละครที่สามารถซื้อได้
  const availableCharacters = [
    {
      type: "knight",
      name: "อัศวิน",
      damage: 10,
      defense: 5,
      cost: 200
    },
    {
      type: "mage",
      name: "นักเวทย์",
      damage: 15,
      defense: 2,
      cost: 300
    },
    {
      type: "archer",
      name: "นักธนู",
      damage: 12,
      defense: 3,
      cost: 250
    }
  ];
  
  // ค้นหาตัวละครตามประเภท
  const characterTemplate = availableCharacters.find(c => c.type === characterType);
  if (!characterTemplate) {
    return { success: false, error: "Character type not found" };
  }
  
  // ตรวจสอบว่ามีเหรียญพอหรือไม่
  if (playerData.coins < characterTemplate.cost) {
    return { success: false, error: "Not enough coins" };
  }
  
  // หักเหรียญ
  playerData.coins -= characterTemplate.cost;
  
  // สร้างตัวละครใหม่
  const newCharacter = {
    id: playerData.characters.length + 1,
    name: characterTemplate.name,
    level: 1,
    damage: characterTemplate.damage,
    defense: characterTemplate.defense,
    cost: characterTemplate.cost,
    experience: 0,
    experienceRequired: 100
  };
  
  // เพิ่มตัวละครลงในข้อมูลผู้เล่น
  playerData.characters.push(newCharacter);
  
  // บันทึกข้อมูลที่อัพเดตลง localStorage
  saveLocalPlayerData(playerData.address, playerData);
  
  return {
    success: true,
    character: newCharacter,
    cost: characterTemplate.cost,
    updatedPlayer: playerData
  };
};

// จำลองการลงทะเบียนผู้เล่น
export const simulatePlayerRegistration = (address: string) => {
  // สร้างข้อมูลผู้เล่นใหม่
  const playerData = generateMockPlayerData(address);
  
  return {
    success: true,
    player: {
      address,
      registered: true,
      timestamp: Date.now()
    },
    txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
};

// จำลองการสร้าง NFT
export const simulateMintNFT = (address: string, uri: string, name: string, description: string, image?: string): MintNFTResult => {
  // ตรวจสอบว่ามีค่าพารามิเตอร์ที่จำเป็นครบถ้วนหรือไม่
  if (!address) {
    address = "0xSimulatedAddress";
  }
  
  // สร้างรหัส token ที่ไม่ซ้ำกัน
  const tokenId = Math.floor(Math.random() * 10000) + 1;
  
  // ดึงข้อมูลผู้เล่นจาก localStorage ถ้ามี
  const playerData = getLocalPlayerData(address);
  
  // สร้างประเภทสินค้าและความหายาก
  const itemTypes = ["weapon", "armor", "accessory", "special", "nft"];
  const rarities = ["common", "uncommon", "rare", "epic", "legendary"];
  const selectedType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
  const selectedRarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  // สร้างไอเทม NFT
  const nftItem: InventoryItem = {
    id: tokenId,
    name: name || "NFT Item",
    description: description || "A unique item",
    itemType: selectedType,
    rarity: selectedRarity,
    power: Math.floor(Math.random() * 10) + 10, // ค่าพลังระหว่าง 10-20
    tokenId: tokenId.toString(),
    image: image || `/items/${selectedType}-${selectedRarity}.png`,
    upgradeLevel: 0,
    price: 0 // ราคาเริ่มต้น
  };
  
  // เพิ่มไอเทมลงในกระเป๋า
  if (playerData) {
    // ตรวจสอบว่ามี inventory แล้วหรือไม่
    if (!playerData.inventory) {
      playerData.inventory = [];
    }
    playerData.inventory.push(nftItem);
    saveLocalPlayerData(address, playerData);
  }
  
  console.log(`NFT minted in simulation mode: ${name}, tokenId: ${tokenId}`);
  
  return {
    success: true,
    tokenId,
    item: nftItem,
    txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
  };
};

// จำลองการอัพเกรดสกิล
export const simulateSkillUpgrade = (skillId: number, playerData: any) => {
  // ค้นหาสกิล
  const skill = playerData.skills.find((s: Skill) => s.id === skillId);
  if (!skill) {
    return { success: false, error: "Skill not found" };
  }
  
  // ตรวจสอบว่าสกิลเลเวลสูงสุดหรือยัง
  if (skill.level >= skill.maxLevel) {
    return { success: false, error: "Skill already at max level" };
  }
  
  // คำนวณราคาอัพเกรด (เพิ่มตามเลเวลสกิล)
  const upgradeCost = skill.cost * (skill.level + 1);
  
  // ตรวจสอบว่ามีเหรียญพอหรือไม่
  if (playerData.coins < upgradeCost) {
    return { success: false, error: "Not enough coins" };
  }
  
  // หักเหรียญ
  playerData.coins -= upgradeCost;
  
  // อัพเกรดสกิล
  skill.level += 1;
  
  // อัพเดตค่าสถานะตามสกิล
  if (skill.effect.target === 'damage') {
    playerData.damage += skill.effect.value;
  }
  
  // บันทึกข้อมูลที่อัพเดตลง localStorage
  saveLocalPlayerData(playerData.address, playerData);
  
  return {
    success: true,
    newLevel: skill.level,
    cost: upgradeCost,
    updatedPlayer: playerData
  };
};

// คำนวณสถานะเพิ่มเติมจากสกิล
export const calculateBonusFromSkills = (playerData: any, bonusType: string) => {
  if (!playerData.skills) return 0;
  
  // กรองสกิลที่มีผลต่อสถานะที่ต้องการและมีเลเวลมากกว่า 0
  const relevantSkills = playerData.skills.filter((skill: Skill) => 
    skill.effect.target === bonusType && skill.level > 0
  );
  
  // คำนวณค่าเพิ่มทั้งหมด
  return relevantSkills.reduce((total: number, skill: Skill) => 
    total + (skill.effect.value * skill.level), 0
  );
};

// จำลองระบบต่อสู้ขั้นสูง
export const simulateAdvancedBattle = (
  playerId: number,
  monsterId: number,
  playerData: any
): AdvancedBattleResult => {
  // ดึงข้อมูลมอนสเตอร์
  const area = playerData.currentArea || "ป่า";
  const areaMonsters = MOCK_MONSTERS[area as keyof typeof MOCK_MONSTERS] || MOCK_MONSTERS["ป่า"];
  const monster = areaMonsters.find((m) => m.id === monsterId) || areaMonsters[0];

  if (!monster) {
    throw new Error(`Monster with ID ${monsterId} not found in area ${area}`);
  }

  // สถานะดั้งเดิมของผู้เล่น
  const initialPlayerState = { ...playerData };

  // ระบบคอมโบ
  const playerCombo = Math.min(playerData.combo || 0, 10);
  const comboBonus = playerCombo * 0.1; // เพิ่มดาเมจ 10% ต่อคอมโบ
  
  // คำนวณดาเมจพื้นฐาน
  let baseDamage = playerData.damage || 1;
  
  // ตรวจสอบสกิลและไอเทมที่มีผลต่อดาเมจ
  const damageBonus = calculateBonusFromSkills(playerData, 'damage');
  baseDamage += damageBonus;
  
  // เพิ่มดาเมจจากคอมโบ
  baseDamage = Math.floor(baseDamage * (1 + comboBonus));
  
  // โอกาสคริติคอล
  const critChance = (playerData.critChance || 0.05) + (playerCombo * 0.02);
  const isCriticalHit = Math.random() < critChance;
  
  // คำนวณดาเมจสุดท้าย
  const damage = isCriticalHit ? Math.floor(baseDamage * 2) : baseDamage;
  
  // ระบบความต้านทาน
  const monsterResistance = monster.resistance || 0;
  const effectiveDamage = Math.max(1, damage - monsterResistance);
  
  // ตรวจสอบว่ามอนสเตอร์ถูกโจมตีจนแพ้หรือไม่
  const defeated = effectiveDamage >= monster.hp;
  
  // คำนวณรางวัลและประสบการณ์
  let reward = 0;
  let experience = 0;
  let comboCounter = defeated ? playerCombo + 1 : 0;
  
  if (defeated) {
    // คำนวณรางวัลเพิ่มเติมจากไอเทมและสกิล
    const goldBonus = calculateBonusFromSkills(playerData, 'coins');
    const expBonus = calculateBonusFromSkills(playerData, 'experience');
    
    reward = Math.floor(monster.reward * (1 + (goldBonus / 100)));
    experience = Math.floor(monster.experience * (1 + (expBonus / 100)));
    
    // เพิ่มโบนัสประสบการณ์และรางวัลจากคอมโบ
    if (comboCounter > 3) {
      reward = Math.floor(reward * (1 + (comboCounter * 0.05)));
      experience = Math.floor(experience * (1 + (comboCounter * 0.05)));
    }
  }
  
  // ระบบดรอปไอเทม
  const dropChanceBonus = calculateBonusFromSkills(playerData, 'dropRate') / 100;
  let baseDropChance = monster.dropChance || 0.1; // 10% โอกาสดรอปพื้นฐาน
  
  // เพิ่มโอกาสดรอปตามคอมโบ
  if (comboCounter > 5) {
    baseDropChance += (comboCounter - 5) * 0.02;
  }
  
  // คำนวณโอกาสดรอปสุดท้าย
  const effectiveDropChance = Math.min(0.8, baseDropChance + dropChanceBonus);
  
  // ตรวจสอบว่าได้ไอเทมหรือไม่
  const itemDropped = defeated && Math.random() < effectiveDropChance;
  let droppedItem: InventoryItem | null = null;
  
  if (itemDropped) {
    // เลือกไอเทมจากพื้นที่ปัจจุบัน
    const areaItems = MOCK_ITEMS.filter(item => !item.area || item.area === area);
    
    if (areaItems.length > 0) {
      // พิจารณาความหายากของไอเทมตามคอมโบ
      let rarityBoost = 0;
      if (comboCounter >= 10) rarityBoost = 0.3;
      else if (comboCounter >= 7) rarityBoost = 0.2;
      else if (comboCounter >= 5) rarityBoost = 0.1;
      
      // คำนวณโอกาสไอเทมตามความหายาก
      let rarityRoll = Math.random();
      let selectedRarity = "common";
      
      rarityRoll += rarityBoost;
      
      if (rarityRoll > 0.98) selectedRarity = "legendary";
      else if (rarityRoll > 0.95) selectedRarity = "epic";
      else if (rarityRoll > 0.85) selectedRarity = "rare";
      else if (rarityRoll > 0.60) selectedRarity = "uncommon";
      
      // เลือกไอเทมตามความหายาก
      const possibleItems = areaItems.filter(item => item.rarity === selectedRarity);
      
      if (possibleItems.length > 0) {
        // สุ่มไอเทมจากรายการที่เป็นไปได้
        const randomIndex = Math.floor(Math.random() * possibleItems.length);
        droppedItem = { ...possibleItems[randomIndex] };
      } else {
        // ถ้าไม่มีไอเทมในหมวดหมู่ความหายากนี้ ให้สุ่มจากไอเทมทั้งหมด
        const randomIndex = Math.floor(Math.random() * areaItems.length);
        droppedItem = { ...areaItems[randomIndex] };
      }
    }
  }
  
  // อัพเดทข้อมูลผู้เล่น
  const updatedPlayerData = { ...playerData };
  
  if (defeated) {
    updatedPlayerData.coins = (updatedPlayerData.coins || 0) + reward;
    updatedPlayerData.experience = (updatedPlayerData.experience || 0) + experience;
    updatedPlayerData.combo = comboCounter;
    
    // เพิ่มไอเทมที่ได้รับลงในกระเป๋า
    if (droppedItem) {
      if (!updatedPlayerData.inventory) updatedPlayerData.inventory = [];
      updatedPlayerData.inventory.push(droppedItem);
    }
    
    // ตรวจสอบว่าเลเวลอัพหรือไม่
    const levelUpCheck = checkLevelUp(updatedPlayerData);
    
    // บันทึกข้อมูลที่อัพเดทลง localStorage
    saveLocalPlayerData(updatedPlayerData.address, updatedPlayerData);
    
    return {
      damage: effectiveDamage,
      defeated: true,
      reward,
      experience,
      itemDropped: !!droppedItem,
      item: droppedItem,
      levelUp: levelUpCheck.isLevelUp,
      updatedPlayer: levelUpCheck.player,
      isCriticalHit,
      comboCounter,
      resistanceApplied: monsterResistance > 0,
      bonusApplied: {
        combo: comboBonus > 0,
        skill: damageBonus > 0,
        crit: isCriticalHit
      },
      battleEffects: generateBattleEffects(isCriticalHit, comboCounter, levelUpCheck.isLevelUp)
    };
  } else {
    // รีเซ็ตคอมโบถ้าไม่สามารถกำจัดมอนสเตอร์ได้
    updatedPlayerData.combo = 0;
    
    // บันทึกข้อมูลที่อัพเดทลง localStorage
    saveLocalPlayerData(updatedPlayerData.address, updatedPlayerData);
    
    return {
      damage: effectiveDamage,
      defeated: false,
      reward: 0,
      experience: 0,
      itemDropped: false,
      item: null,
      levelUp: false,
      updatedPlayer: updatedPlayerData,
      isCriticalHit,
      comboCounter: 0,
      resistanceApplied: monsterResistance > 0,
      bonusApplied: {
        combo: comboBonus > 0,
        skill: damageBonus > 0,
        crit: isCriticalHit
      },
      battleEffects: generateBattleEffects(isCriticalHit, 0, false)
    };
  }
};

// สร้างเอฟเฟกต์การต่อสู้
function generateBattleEffects(isCritical: boolean, combo: number, levelUp: boolean): BattleEffects {
  return {
    visualEffects: {
      shake: isCritical || combo >= 5,
      flash: isCritical,
      particles: combo >= 3 ? combo * 5 : 0,
      glow: levelUp || combo >= 8,
      colorEffects: isCritical ? "critical" : combo >= 10 ? "legendary" : combo >= 5 ? "rare" : "normal"
    },
    soundEffects: {
      hit: true,
      critical: isCritical,
      combo: combo >= 3,
      levelUp: levelUp,
      itemDrop: Math.random() < 0.3 // 30% chance for sound effect even if no item dropped
    },
    feedbackMessages: generateFeedbackMessages(isCritical, combo, levelUp)
  };
}

// สร้างข้อความตอบสนองต่อการต่อสู้
function generateFeedbackMessages(isCritical: boolean, combo: number, levelUp: boolean): string[] {
  const messages: string[] = [];
  
  if (isCritical) {
    messages.push("คริติคอล!");
  }
  
  if (combo >= 3) {
    messages.push(`คอมโบ x${combo}!`);
  }
  
  if (combo >= 5) {
    messages.push("คอมโบสุดยอด!");
  }
  
  if (combo >= 10) {
    messages.push("คอมโบระดับตำนาน!");
  }
  
  if (levelUp) {
    messages.push("เลเวลอัพ!");
  }
  
  return messages;
}

// ประเภทข้อมูลสำหรับผลลัพธ์การต่อสู้ขั้นสูง
export interface AdvancedBattleResult extends AttackResult {
  resistanceApplied: boolean;
  bonusApplied: {
    combo: boolean;
    skill: boolean;
    crit: boolean;
  };
  battleEffects: BattleEffects;
}

// ประเภทข้อมูลสำหรับเอฟเฟกต์การต่อสู้
export interface BattleEffects {
  visualEffects: {
    shake: boolean;
    flash: boolean;
    particles: number;
    glow: boolean;
    colorEffects: 'normal' | 'rare' | 'epic' | 'legendary' | 'critical';
  };
  soundEffects: {
    hit: boolean;
    critical: boolean;
    combo: boolean;
    levelUp: boolean;
    itemDrop: boolean;
  };
  feedbackMessages: string[];
} 