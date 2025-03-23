export const GameContract = {
  address: process.env.NEXT_PUBLIC_GAME_CONTRACT_ADDRESS as string,
  abi: [
    // ฟังก์ชันการโจมตี
    "function attack(uint256 monsterId) returns (uint256 damage, bool defeated, uint256 reward)",
    "function multiAttack(uint256 attackCount) returns (uint256 totalDamage, uint256 monstersDefeated, uint256 totalReward)",

    // ฟังก์ชันดูข้อมูล
    "function getPlayerStats(address player) view returns (uint256 coins, uint256 damage, uint256 autoDamage, uint256 lastAttackTime, uint256 monstersDefeated, string currentArea, bool exists)",
    "function getMonsterStats(uint256 monsterId) view returns (uint256 id, string name, uint256 hp, uint256 maxHp, uint256 reward, string monsterType)",
    "function getMonstersInArea(string area) view returns (tuple(uint256 id, string name, uint256 hp, uint256 maxHp, uint256 reward, string monsterType)[] monsters)",
    "function getPlayerCharacters(address player) view returns (tuple(uint256 id, string name, uint256 level, uint256 damage, uint256 defense, uint256 cost)[] characters)",
    "function getPlayerItems(address player) view returns (tuple(uint256 id, string name, string itemType, string rarity, uint256 power, uint256 price)[] items)",

    // ฟังก์ชันอัพเกรด
    "function upgradeCharacter(uint256 characterId) returns (uint256 newLevel, uint256 cost)",
    "function purchaseCharacter(string characterName) returns (uint256 characterId)",
    "function registerPlayer() returns (bool success)",
    "function changeArea(string newArea) returns (bool success)",
    "function mintItemNFT(uint256 itemId) returns (uint256 tokenId)",

    // ฟังก์ชันอื่นๆ
    "function areas(uint256) view returns (string)",
    "function monsters(uint256) view returns (uint256 id, string name, uint256 hp, uint256 maxHp, uint256 reward, string monsterType)",
    "function ATTACK_COOLDOWN() view returns (uint256)",
    "function ITEM_DROP_CHANCE() view returns (uint256)",
    "function MAX_LEVEL() view returns (uint256)",
    "function MAX_MULTI_ATTACK() view returns (uint256)",
    "function addArea(string areaName)",
    "function addMonster(uint256 id, string name, uint256 hp, uint256 reward, string monsterType, string area)",
    "function withdraw(uint256 amount)",
    "function setBaseURI(string baseURI)",

    // Events
    "event AttackPerformed(address indexed player, uint256 indexed monsterId, uint256 damage, bool defeated)",
    "event MultiAttackPerformed(address indexed player, uint256 attackCount, uint256 totalDamage, uint256 monstersDefeated)",
    "event MonsterDefeated(address indexed player, uint256 indexed monsterId, uint256 reward)",
    "event ItemFound(address indexed player, uint256 indexed itemId, string itemName, string rarity)",
    "event CharacterPurchased(address indexed player, uint256 indexed characterId, string name, uint256 cost)",
    "event CharacterUpgraded(address indexed player, uint256 indexed characterId, uint256 newLevel, uint256 cost)",
    "event AreaChanged(address indexed player, string newArea)",
    "event PlayerRegistered(address indexed player)",
    "event NFTMinted(address indexed player, uint256 indexed tokenId, uint256 itemId)",
    {
      inputs: [
        {
          internalType: "address",
          name: "initialOwner",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "ERC721IncorrectOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ERC721InsufficientApproval",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "approver",
          type: "address",
        },
      ],
      name: "ERC721InvalidApprover",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "ERC721InvalidOperator",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "ERC721InvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "receiver",
          type: "address",
        },
      ],
      name: "ERC721InvalidReceiver",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ERC721NonexistentToken",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "OwnableInvalidOwner",
      type: "error",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "OwnableUnauthorizedAccount",
      type: "error",
    },
    {
      inputs: [],
      name: "ReentrancyGuardReentrantCall",
      type: "error",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "newArea",
          type: "string",
        },
      ],
      name: "AreaChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "monsterId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "damage",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "defeated",
          type: "bool",
        },
      ],
      name: "AttackPerformed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "characterId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "cost",
          type: "uint256",
        },
      ],
      name: "CharacterPurchased",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "characterId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "newLevel",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "cost",
          type: "uint256",
        },
      ],
      name: "CharacterUpgraded",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "approved",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          indexed: false,
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "ApprovalForAll",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "itemId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "string",
          name: "itemName",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "rarity",
          type: "string",
        },
      ],
      name: "ItemFound",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "monsterId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "reward",
          type: "uint256",
        },
      ],
      name: "MonsterDefeated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "attackCount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "totalDamage",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "monstersDefeated",
          type: "uint256",
        },
      ],
      name: "MultiAttackPerformed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "itemId",
          type: "uint256",
        },
      ],
      name: "NFTMinted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "previousOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "PlayerRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [],
      name: "ATTACK_COOLDOWN",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "ITEM_DROP_CHANCE",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MAX_LEVEL",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "MAX_MULTI_ATTACK",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "areaName",
          type: "string",
        },
      ],
      name: "addArea",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "hp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reward",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "monsterType",
          type: "string",
        },
        {
          internalType: "string",
          name: "area",
          type: "string",
        },
      ],
      name: "addMonster",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "monsterId",
          type: "uint256",
        },
      ],
      name: "attack",
      outputs: [
        {
          internalType: "uint256",
          name: "damage",
          type: "uint256",
        },
        {
          internalType: "bool",
          name: "defeated",
          type: "bool",
        },
        {
          internalType: "uint256",
          name: "reward",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "areas",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "newArea",
          type: "string",
        },
      ],
      name: "changeArea",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "getApproved",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "area",
          type: "string",
        },
      ],
      name: "getMonstersInArea",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "hp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "maxHp",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "reward",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "monsterType",
              type: "string",
            },
          ],
          internalType: "struct AdventureClicker.Monster[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "getPlayerCharacters",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "level",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "damage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "defense",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "cost",
              type: "uint256",
            },
          ],
          internalType: "struct AdventureClicker.Character[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "getPlayerData",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "coins",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "damage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "autoDamage",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "lastAttackTime",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "monstersDefeated",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "currentArea",
              type: "string",
            },
            {
              internalType: "bool",
              name: "exists",
              type: "bool",
            },
          ],
          internalType: "struct AdventureClicker.Player",
          name: "",
          type: "tuple",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "player",
          type: "address",
        },
      ],
      name: "getPlayerItems",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256",
            },
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "string",
              name: "itemType",
              type: "string",
            },
            {
              internalType: "string",
              name: "rarity",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "power",
              type: "uint256",
            },
            {
              internalType: "uint256",
              name: "price",
              type: "uint256",
            },
          ],
          internalType: "struct AdventureClicker.Item[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "owner",
          type: "address",
        },
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
      ],
      name: "isApprovedForAll",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "itemId",
          type: "uint256",
        },
      ],
      name: "mintItemNFT",
      outputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "monsters",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "hp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "maxHp",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "reward",
          type: "uint256",
        },
        {
          internalType: "string",
          name: "monsterType",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "attackCount",
          type: "uint256",
        },
      ],
      name: "multiAttack",
      outputs: [
        {
          internalType: "uint256",
          name: "totalDamage",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "monstersDefeated",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "totalReward",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "ownerOf",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "characterName",
          type: "string",
        },
      ],
      name: "purchaseCharacter",
      outputs: [
        {
          internalType: "uint256",
          name: "characterId",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "registerPlayer",
      outputs: [
        {
          internalType: "bool",
          name: "success",
          type: "bool",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "renounceOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "safeTransferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "operator",
          type: "address",
        },
        {
          internalType: "bool",
          name: "approved",
          type: "bool",
        },
      ],
      name: "setApprovalForAll",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "baseURI",
          type: "string",
        },
      ],
      name: "setBaseURI",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "bytes4",
          name: "interfaceId",
          type: "bytes4",
        },
      ],
      name: "supportsInterface",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "tokenURI",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "tokenToItem",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "from",
          type: "address",
        },
        {
          internalType: "address",
          name: "to",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "newOwner",
          type: "address",
        },
      ],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "characterId",
          type: "uint256",
        },
      ],
      name: "upgradeCharacter",
      outputs: [
        {
          internalType: "uint256",
          name: "newLevel",
          type: "uint256",
        },
        {
          internalType: "uint256",
          name: "cost",
          type: "uint256",
        },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};
