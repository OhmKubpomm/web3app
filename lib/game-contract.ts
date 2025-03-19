import { type Address, parseAbi } from "viem"

// ABI ของสัญญาอัจฉริยะเกม
export const GAME_CONTRACT_ABI = parseAbi([
  // ฟังก์ชันโจมตีมอนสเตอร์
  "function attackMonster(uint256 monsterId) public returns (uint256 damage)",

  // ฟังก์ชันโจมตีมอนสเตอร์หลายครั้ง
  "function multiAttack(uint256 monsterId, uint256 times) public returns (uint256 totalDamage)",

  // ฟังก์ชันรับข้อมูลมอนสเตอร์
  "function getMonster(uint256 monsterId) public view returns (tuple(string name, uint256 hp, uint256 maxHp, uint256 level))",

  // อีเวนต์เมื่อมอนสเตอร์ถูกโจมตี
  "event MonsterAttacked(uint256 indexed monsterId, address indexed player, uint256 damage, uint256 remainingHp)",

  // อีเวนต์เมื่อมอนสเตอร์พ่ายแพ้
  "event MonsterDefeated(uint256 indexed monsterId, address indexed player, uint256 reward)",
])

// ที่อยู่ของสัญญาอัจฉริยะเกม
export const GAME_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS as Address) || "0x0000000000000000000000000000000000000000"

import { ethers } from "ethers"

// ฟังก์ชันสร้าง contract instance
export function getGameContract(provider: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(GAME_CONTRACT_ADDRESS, GAME_CONTRACT_ABI, provider)
}

