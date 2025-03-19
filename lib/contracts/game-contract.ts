export const GameContract = {
  abi: [
    {
      inputs: [{ internalType: "uint256", name: "monsterId", type: "uint256" }],
      name: "attackMonster",
      outputs: [
        { internalType: "uint256", name: "damage", type: "uint256" },
        { internalType: "uint256", name: "reward", type: "uint256" },
        { internalType: "bool", name: "defeated", type: "bool" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
      name: "multiAttack",
      outputs: [
        { internalType: "uint256", name: "totalDamage", type: "uint256" },
        { internalType: "uint256", name: "totalReward", type: "uint256" },
        { internalType: "bool", name: "defeated", type: "bool" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "claimDailyReward",
      outputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  address: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
}

