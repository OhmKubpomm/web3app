// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdventureClicker is ERC721URIStorage, Ownable, ReentrancyGuard {
    // ค่าคงที่
    uint8 private constant ATTACK_COOLDOWN = 1; // 1 วินาที
    uint8 private constant ITEM_DROP_CHANCE = 10; // 10%
    uint8 private constant MAX_LEVEL = 100;
    uint8 private constant MAX_MULTI_ATTACK = 100;
    uint8 private constant BATCH_MINT_LIMIT = 10;

    // โครงสร้างข้อมูลที่ปรับปรุงให้กระชับขึ้น
    struct Player {
        uint128 coins;
        uint32 damage;
        uint32 autoDamage;
        uint32 lastAttackTime;
        uint32 monstersDefeated;
        string currentArea;
        bool exists;
    }

    struct Monster {
        uint16 id;
        string name;
        uint32 hp;
        uint32 maxHp;
        uint32 reward;
        string monsterType;
    }

    struct Character {
        uint16 id;
        string name;
        uint8 level;
        uint32 damage;
        uint32 defense;
        uint32 cost;
    }

    struct Item {
        uint16 id;
        string name;
        string itemType;
        string rarity;
        uint32 power;
        uint32 price;
    }

    // ตัวแปรสถานะ
    string[] public areas;
    mapping(uint256 => Monster) public monsters;
    mapping(string => uint256[]) private areaMonsters;
    mapping(address => Player) private players;
    mapping(address => Character[]) private playerCharacters;
    mapping(address => Item[]) private playerItems;
    mapping(uint256 => uint256) public tokenToItem;
    
    uint16 private nextMonsterId = 1;
    uint16 private nextCharacterId = 1;
    uint16 private nextItemId = 1;
    uint16 private nextTokenId = 1;

    // Events
    event AttackPerformed(address indexed player, uint256 indexed monsterId, uint256 damage, bool defeated);
    event MultiAttackPerformed(address indexed player, uint256 attackCount, uint256 totalDamage, uint256 monstersDefeated);
    event MonsterDefeated(address indexed player, uint256 indexed monsterId, uint256 reward);
    event ItemFound(address indexed player, uint256 indexed itemId, string itemName, string rarity);
    event CharacterPurchased(address indexed player, uint256 indexed characterId, string name, uint256 cost);
    event CharacterUpgraded(address indexed player, uint256 indexed characterId, uint256 newLevel, uint256 cost);
    event AreaChanged(address indexed player, string newArea);
    event PlayerRegistered(address indexed player);
    event NFTMinted(address indexed player, uint256 indexed tokenId, uint256 itemId);
    event BatchNFTMinted(address indexed player, uint256[] tokenIds);

    // Constructor
    constructor(address initialOwner) ERC721("AdventureItems", "ADVITM") Ownable(initialOwner) {
        // เพิ่มพื้นที่เริ่มต้น
        areas = ["Forest", "Cave", "Mountain", "Castle"];
        
        // เพิ่มมอนสเตอร์เริ่มต้น
        _addMonster(1, "Slime", 10, 5, "Normal", "Forest");
        _addMonster(2, "Goblin", 20, 10, "Normal", "Forest");
        _addMonster(3, "Wolf", 30, 15, "Beast", "Forest");
        _addMonster(4, "Bat", 15, 8, "Flying", "Cave");
        _addMonster(5, "Skeleton", 40, 20, "Undead", "Cave");
        _addMonster(6, "Golem", 100, 50, "Earth", "Mountain");
        _addMonster(7, "Dragon", 200, 100, "Dragon", "Mountain");
        _addMonster(8, "Knight", 150, 75, "Human", "Castle");
        _addMonster(9, "Wizard", 120, 60, "Human", "Castle");
        _addMonster(10, "Demon", 500, 250, "Demon", "Castle");
    }

    // Modifiers
    modifier playerExists() {
        require(players[msg.sender].exists, "No player");
        _;
    }

    modifier monsterExists(uint256 monsterId) {
        require(monsters[monsterId].id > 0, "No monster");
        _;
    }

    // ฟังก์ชันสำหรับผู้เล่น
    function registerPlayer() external returns (bool) {
        require(!players[msg.sender].exists, "Already exists");
        
        players[msg.sender] = Player({
            coins: 0,
            damage: 1,
            autoDamage: 0,
            lastAttackTime: uint32(block.timestamp),
            monstersDefeated: 0,
            currentArea: "Forest",
            exists: true
        });
        
        // เพิ่มตัวละครเริ่มต้น
        playerCharacters[msg.sender].push(Character({
            id: nextCharacterId++,
            name: "Adventurer",
            level: 1,
            damage: 1,
            defense: 1,
            cost: 0
        }));
        
        emit PlayerRegistered(msg.sender);
        return true;
    }

    function attack(uint256 monsterId) external playerExists monsterExists(monsterId) returns (uint256 damage, bool defeated, uint256 reward) {
        require(block.timestamp >= players[msg.sender].lastAttackTime + ATTACK_COOLDOWN, "Cooldown");
        
        Player storage player = players[msg.sender];
        Monster storage monster = monsters[monsterId];
        
        // ตรวจสอบว่ามอนสเตอร์อยู่ในพื้นที่ปัจจุบันของผู้เล่น
        bool monsterInArea = false;
        for (uint256 i = 0; i < areaMonsters[player.currentArea].length; i++) {
            if (areaMonsters[player.currentArea][i] == monsterId) {
                monsterInArea = true;
                break;
            }
        }
        require(monsterInArea, "Not in area");
        
        // คำนวณความเสียหาย
        damage = player.damage;
        
        // อัพเดตเวลาโจมตีล่าสุด
        player.lastAttackTime = uint32(block.timestamp);
        
        // ตรวจสอบว่ามอนสเตอร์พ่ายแพ้หรือไม่
        if (damage >= monster.hp) {
            // มอนสเตอร์พ่ายแพ้
            defeated = true;
            reward = monster.reward;
            
            // เพิ่มเหรียญและจำนวนมอนสเตอร์ที่พ่ายแพ้
            player.coins += uint128(reward);
            player.monstersDefeated++;
            
            // รีเซ็ต HP ของมอนสเตอร์
            monster.hp = monster.maxHp;
            
            // มีโอกาสได้รับไอเทม
            if (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, monsterId))) % 100 < ITEM_DROP_CHANCE) {
                _generateRandomItem();
            }
            
            emit MonsterDefeated(msg.sender, monsterId, reward);
        } else {
            // มอนสเตอร์ยังไม่พ่ายแพ้
            defeated = false;
            reward = 0;
            
            // ลด HP ของมอนสเตอร์
            monster.hp -= uint32(damage);
        }
        
        emit AttackPerformed(msg.sender, monsterId, damage, defeated);
        return (damage, defeated, reward);
    }

    // ฟังก์ชันโจมตีหลายครั้งที่ปรับปรุงแล้ว - ลดการใช้ gas
    function multiAttack(uint256 attackCount) external playerExists nonReentrant returns (uint256 totalDamage, uint256 monstersDefeated, uint256 totalReward) {
        require(attackCount > 0 && attackCount <= MAX_MULTI_ATTACK, "Invalid count");
        require(block.timestamp >= players[msg.sender].lastAttackTime + ATTACK_COOLDOWN, "Cooldown");
        
        Player storage player = players[msg.sender];
        
        // ค้นหามอนสเตอร์ในพื้นที่ปัจจุบัน
        uint256[] memory monsterIds = areaMonsters[player.currentArea];
        require(monsterIds.length > 0, "No monsters");
        
        totalDamage = 0;
        monstersDefeated = 0;
        totalReward = 0;
        
        // อัพเดตเวลาโจมตีล่าสุด
        player.lastAttackTime = uint32(block.timestamp);
        
        // ใช้ seed เดียวสำหรับการสุ่มทั้งหมดเพื่อประหยัด gas
        uint256 randomSeed = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));
        
        for (uint256 i = 0; i < attackCount; i++) {
            // เลือกมอนสเตอร์แบบสุ่ม
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(randomSeed, i))) % monsterIds.length;
            uint256 monsterId = monsterIds[randomIndex];
            Monster storage monster = monsters[monsterId];
            
            // คำนวณความเสียหาย
            uint256 damage = player.damage;
            totalDamage += damage;
            
            // ตรวจสอบว่ามอนสเตอร์พ่ายแพ้หรือไม่
            if (damage >= monster.hp) {
                // มอนสเตอร์พ่ายแพ้
                monstersDefeated++;
                totalReward += monster.reward;
                
                // รีเซ็ต HP ของมอนสเตอร์
                monster.hp = monster.maxHp;
                
                // มีโอกาสได้รับไอเทม
                if (uint256(keccak256(abi.encodePacked(randomSeed, i, monsterId))) % 100 < ITEM_DROP_CHANCE) {
                    _generateRandomItem();
                }
            } else {
                // มอนสเตอร์ยังไม่พ่ายแพ้
                monster.hp -= uint32(damage);
            }
        }
        
        // เพิ่มเหรียญและจำนวนมอนสเตอร์ที่พ่ายแพ้
        player.coins += uint128(totalReward);
        player.monstersDefeated += uint32(monstersDefeated);
        
        emit MultiAttackPerformed(msg.sender, attackCount, totalDamage, monstersDefeated);
        return (totalDamage, monstersDefeated, totalReward);
    }

    function changeArea(string calldata newArea) external playerExists returns (bool) {
        bool areaExists = false;
        for (uint256 i = 0; i < areas.length; i++) {
            if (keccak256(bytes(areas[i])) == keccak256(bytes(newArea))) {
                areaExists = true;
                break;
            }
        }
        require(areaExists, "No area");
        
        players[msg.sender].currentArea = newArea;
        
        emit AreaChanged(msg.sender, newArea);
        return true;
    }

    function upgradeCharacter(uint256 characterId) external playerExists returns (uint256 newLevel, uint256 cost) {
        Player storage player = players[msg.sender];
        
        // ค้นหาตัวละคร
        uint256 charIndex = type(uint256).max;
        for (uint256 i = 0; i < playerCharacters[msg.sender].length; i++) {
            if (playerCharacters[msg.sender][i].id == characterId) {
                charIndex = i;
                break;
            }
        }
        require(charIndex != type(uint256).max, "No character");
        
        Character storage character = playerCharacters[msg.sender][charIndex];
        require(character.level < MAX_LEVEL, "Max level");
        
        // คำนวณค่าใช้จ่ายในการอัพเกรด
        cost = character.cost * (character.level + 1);
        require(player.coins >= cost, "Not enough coins");
        
        // หักเหรียญ
        player.coins -= uint128(cost);
        
        // อัพเกรดตัวละคร
        character.level++;
        character.damage += 2;
        character.defense += 1;
        
        // อัพเดตพลังโจมตีของผู้เล่น
        player.damage += 2;
        
        emit CharacterUpgraded(msg.sender, characterId, character.level, cost);
        return (character.level, cost);
    }

    function mintItemNFT(uint256 itemId) external playerExists returns (uint256 tokenId) {
        // ค้นหาไอเทม
        uint256 itemIndex = type(uint256).max;
        for (uint256 i = 0; i < playerItems[msg.sender].length; i++) {
            if (playerItems[msg.sender][i].id == itemId) {
                itemIndex = i;
                break;
            }
        }
        require(itemIndex != type(uint256).max, "No item");
        
        Item storage item = playerItems[msg.sender][itemIndex];
        
        tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        
        // สร้าง metadata URI
        string memory json = string(abi.encodePacked(
            '{"name":"', item.name, '",',
            '"description":"', item.name, ' - ', item.rarity, ' ', item.itemType, '",',
            '"attributes":[',
            '{"trait_type":"Type","value":"', item.itemType, '"},',
            '{"trait_type":"Rarity","value":"', item.rarity, '"},',
            '{"trait_type":"Power","value":', _uint2str(item.power), '}',
            ']}'
        ));
        
        string memory uri = string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
        
        _setTokenURI(tokenId, uri);
        
        // บันทึกความสัมพันธ์ระหว่าง token และ item
        tokenToItem[tokenId] = itemId;
        
        emit NFTMinted(msg.sender, tokenId, itemId);
        return tokenId;
    }

    // ฟังก์ชันดูข้อมูล
    function getPlayerData(address player) external view returns (Player memory) {
        return players[player];
    }

    function getPlayerCharacters(address player) external view returns (Character[] memory) {
        return playerCharacters[player];
    }

    function getPlayerItems(address player) external view returns (Item[] memory) {
        return playerItems[player];
    }

    function getMonstersInArea(string calldata area) external view returns (Monster[] memory) {
        uint256[] memory monsterIds = areaMonsters[area];
        Monster[] memory result = new Monster[](monsterIds.length);
        
        for (uint256 i = 0; i < monsterIds.length; i++) {
            result[i] = monsters[monsterIds[i]];
        }
        
        return result;
    }

    // ฟังก์ชันสำหรับเจ้าของ contract
    function addArea(string calldata areaName) external onlyOwner {
        for (uint256 i = 0; i < areas.length; i++) {
            require(keccak256(bytes(areas[i])) != keccak256(bytes(areaName)), "Area exists");
        }
        
        areas.push(areaName);
    }

    function addMonster(
        uint16 id,
        string calldata name,
        uint32 hp,
        uint32 reward,
        string calldata monsterType,
        string calldata area
    ) external onlyOwner {
        _addMonster(id, name, hp, reward, monsterType, area);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ฟังก์ชันภายใน
    function _addMonster(
        uint16 id,
        string memory name,
        uint32 hp,
        uint32 reward,
        string memory monsterType,
        string memory area
    ) internal {
        require(monsters[id].id == 0, "Monster exists");
        
        bool areaExists = false;
        for (uint256 i = 0; i < areas.length; i++) {
            if (keccak256(bytes(areas[i])) == keccak256(bytes(area))) {
                areaExists = true;
                break;
            }
        }
        require(areaExists, "No area");
        
        monsters[id] = Monster({
            id: id,
            name: name,
            hp: hp,
            maxHp: hp,
            reward: reward,
            monsterType: monsterType
        });
        
        areaMonsters[area].push(id);
        
        if (id >= nextMonsterId) {
            nextMonsterId = id + 1;
        }
    }

    function _generateRandomItem() internal {
        string[3] memory itemTypes = ["Weapon", "Armor", "Accessory"];
        string[5] memory rarities = ["Common", "Uncommon", "Rare", "Epic", "Legendary"];
        
        // สุ่มประเภทไอเทม
        uint256 typeIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "type"))) % 3;
        string memory itemType = itemTypes[typeIndex];
        
        // สุ่มความหายาก
        uint256 rarityIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, "rarity"))) % 5;
        string memory rarity = rarities[rarityIndex];
        
        // คำนวณพลังและราคาตามความหายาก
        uint32 power = uint32((rarityIndex + 1) * 5);
        uint32 price = uint32((rarityIndex + 1) * 50);
        
        // สร้างชื่อไอเทม
        string memory name = string(abi.encodePacked(rarity, " ", itemType));
        
        // เพิ่มไอเทม
        uint16 itemId = nextItemId++;
        playerItems[msg.sender].push(Item({
            id: itemId,
            name: name,
            itemType: itemType,
            rarity: rarity,
            power: power,
            price: price
        }));
        
        emit ItemFound(msg.sender, itemId, name, rarity);
    }

    // ฟังก์ชันช่วยเหลือ
    function _uint2str(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";

        uint256 encodedLen = 4 * ((len + 2) / 3);
        string memory result = new string(encodedLen + 32);

        assembly {
            mstore(result, encodedLen)
            let tablePtr := add(TABLE, 1)
            let dataPtr := data
            let endPtr := add(dataPtr, len)
            let resultPtr := add(result, 32)

            for {} lt(dataPtr, endPtr) {}
            {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }
        }

        return result;
    }
}

