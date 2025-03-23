// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AdventureClicker is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // ค่าคงที่
    uint256 public constant ATTACK_COOLDOWN = 1 seconds; // ระยะเวลาระหว่างการโจมตี
    uint256 public constant ITEM_DROP_CHANCE = 10; // โอกาสในการดรอปไอเทม (10%)
    uint256 public constant MAX_LEVEL = 100; // เลเวลสูงสุด
    uint256 public constant MAX_MULTI_ATTACK = 100; // จำนวนการโจมตีสูงสุดในครั้งเดียว

    // โครงสร้างข้อมูล
    struct Player {
        uint256 coins;
        uint256 damage;
        uint256 autoDamage;
        uint256 lastAttackTime;
        uint256 monstersDefeated;
        string currentArea;
        bool exists;
    }

    struct Monster {
        uint256 id;
        string name;
        uint256 hp;
        uint256 maxHp;
        uint256 reward;
        string monsterType;
    }

    struct Character {
        uint256 id;
        string name;
        uint256 level;
        uint256 damage;
        uint256 defense;
        uint256 cost;
    }

    struct Item {
        uint256 id;
        string name;
        string itemType; // weapon, armor, accessory
        string rarity; // common, uncommon, rare, epic, legendary
        uint256 power;
        uint256 price;
    }

    // ตัวแปรสถานะ
    string[] public areas;
    mapping(uint256 => Monster) public monsters;
    mapping(string => uint256[]) private areaMonsters;
    mapping(address => Player) private players;
    mapping(address => Character[]) private playerCharacters;
    mapping(address => Item[]) private playerItems;
    mapping(uint256 => uint256) public tokenToItem;
    
    uint256 private nextMonsterId = 1;
    uint256 private nextCharacterId = 1;
    uint256 private nextItemId = 1;
    uint256 private nextTokenId = 1;
    string private baseURI;

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

    // Constructor
    constructor(address initialOwner) ERC721("AdventureItems", "ADVITM") Ownable(initialOwner) {
        // เพิ่มพื้นที่เริ่มต้น
        areas.push("Forest");
        areas.push("Cave");
        areas.push("Mountain");
        areas.push("Castle");
        
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
        _addMonster(10, "Demon Lord", 500, 250, "Demon", "Castle");
    }

    // Modifiers
    modifier playerExists() {
        require(players[msg.sender].exists, "Player does not exist");
        _;
    }

    modifier monsterExists(uint256 monsterId) {
        require(monsters[monsterId].id > 0, "Monster does not exist");
        _;
    }

    modifier characterExists(uint256 characterId) {
        bool found = false;
        for (uint256 i = 0; i < playerCharacters[msg.sender].length; i++) {
            if (playerCharacters[msg.sender][i].id == characterId) {
                found = true;
                break;
            }
        }
        require(found, "Character does not exist");
        _;
    }

    modifier itemExists(uint256 itemId) {
        bool found = false;
        for (uint256 i = 0; i < playerItems[msg.sender].length; i++) {
            if (playerItems[msg.sender][i].id == itemId) {
                found = true;
                break;
            }
        }
        require(found, "Item does not exist");
        _;
    }

    // ฟังก์ชันสำหรับผู้เล่น
    function registerPlayer() external returns (bool success) {
        require(!players[msg.sender].exists, "Player already exists");
        
        players[msg.sender] = Player({
            coins: 0,
            damage: 1,
            autoDamage: 0,
            lastAttackTime: block.timestamp,
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
        require(block.timestamp >= players[msg.sender].lastAttackTime + ATTACK_COOLDOWN, "Attack on cooldown");
        
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
        require(monsterInArea, "Monster not in current area");
        
        // คำนวณความเสียหาย
        damage = player.damage;
        
        // อัพเดตเวลาโจมตีล่าสุด
        player.lastAttackTime = block.timestamp;
        
        // ตรวจสอบว่ามอนสเตอร์พ่ายแพ้หรือไม่
        if (damage >= monster.hp) {
            // มอนสเตอร์พ่ายแพ้
            defeated = true;
            reward = monster.reward;
            
            // เพิ่มเหรียญและจำนวนมอนสเตอร์ที่พ่ายแพ้
            player.coins += reward;
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
            monster.hp -= damage;
        }
        
        emit AttackPerformed(msg.sender, monsterId, damage, defeated);
        return (damage, defeated, reward);
    }

    function multiAttack(uint256 attackCount) external playerExists returns (uint256 totalDamage, uint256 monstersDefeated, uint256 totalReward) {
        require(attackCount > 0 && attackCount <= MAX_MULTI_ATTACK, "Invalid attack count");
        require(block.timestamp >= players[msg.sender].lastAttackTime + ATTACK_COOLDOWN, "Attack on cooldown");
        
        Player storage player = players[msg.sender];
        
        // ค้นหามอนสเตอร์ในพื้นที่ปัจจุบัน
        uint256[] memory monsterIds = areaMonsters[player.currentArea];
        require(monsterIds.length > 0, "No monsters in current area");
        
        totalDamage = 0;
        monstersDefeated = 0;
        totalReward = 0;
        
        // อัพเดตเวลาโจมตีล่าสุด
        player.lastAttackTime = block.timestamp;
        
        for (uint256 i = 0; i < attackCount; i++) {
            // เลือกมอนสเตอร์แบบสุ่ม
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, i))) % monsterIds.length;
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
                
                // เพิ่มเหรียญและจำนวนมอนสเตอร์ที่พ่ายแพ้
                player.coins += monster.reward;
                player.monstersDefeated++;
                
                // รีเซ็ต HP ของมอนสเตอร์
                monster.hp = monster.maxHp;
                
                // มีโอกาสได้รับไอเทม
                if (uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, monsterId, i))) % 100 < ITEM_DROP_CHANCE) {
                    _generateRandomItem();
                }
                
                emit MonsterDefeated(msg.sender, monsterId, monster.reward);
            } else {
                // มอนสเตอร์ยังไม่พ่ายแพ้
                monster.hp -= damage;
            }
        }
        
        emit MultiAttackPerformed(msg.sender, attackCount, totalDamage, monstersDefeated);
        return (totalDamage, monstersDefeated, totalReward);
    }

    function changeArea(string calldata newArea) external playerExists returns (bool success) {
        bool areaExists = false;
        for (uint256 i = 0; i < areas.length; i++) {
            if (keccak256(bytes(areas[i])) == keccak256(bytes(newArea))) {
                areaExists = true;
                break;
            }
        }
        require(areaExists, "Area does not exist");
        
        players[msg.sender].currentArea = newArea;
        
        emit AreaChanged(msg.sender, newArea);
        return true;
    }

    function purchaseCharacter(string calldata characterName) external playerExists returns (uint256 characterId) {
        Player storage player = players[msg.sender];
        
        uint256 cost = 0;
        uint256 damage = 0;
        uint256 defense = 0;
        
        if (keccak256(bytes(characterName)) == keccak256(bytes("Warrior"))) {
            cost = 100;
            damage = 5;
            defense = 5;
        } else if (keccak256(bytes(characterName)) == keccak256(bytes("Mage"))) {
            cost = 150;
            damage = 8;
            defense = 2;
        } else if (keccak256(bytes(characterName)) == keccak256(bytes("Archer"))) {
            cost = 120;
            damage = 6;
            defense = 3;
        } else {
            revert("Invalid character name");
        }
        
        require(player.coins >= cost, "Not enough coins");
        
        // หักเหรียญ
        player.coins -= cost;
        
        // เพิ่มตัวละคร
        characterId = nextCharacterId++;
        playerCharacters[msg.sender].push(Character({
            id: characterId,
            name: characterName,
            level: 1,
            damage: damage,
            defense: defense,
            cost: cost
        }));
        
        // อัพเดตพลังโจมตีของผู้เล่น
        player.damage += damage;
        
        emit CharacterPurchased(msg.sender, characterId, characterName, cost);
        return characterId;
    }

    function upgradeCharacter(uint256 characterId) external playerExists characterExists(characterId) returns (uint256 newLevel, uint256 cost) {
        Player storage player = players[msg.sender];
        
        Character storage character;
        for (uint256 i = 0; i < playerCharacters[msg.sender].length; i++) {
            if (playerCharacters[msg.sender][i].id == characterId) {
                character = playerCharacters[msg.sender][i];
                break;
            }
        }
        
        require(character.level < MAX_LEVEL, "Character already at max level");
        
        // คำนวณค่าใช้จ่ายในการอัพเกรด
        cost = character.cost * (character.level + 1);
        require(player.coins >= cost, "Not enough coins");
        
        // หักเหรียญ
        player.coins -= cost;
        
        // อัพเกรดตัวละคร
        character.level++;
        character.damage += 2;
        character.defense += 1;
        
        // อัพเดตพลังโจมตีของผู้เล่น
        player.damage += 2;
        
        emit CharacterUpgraded(msg.sender, characterId, character.level, cost);
        return (character.level, cost);
    }

    function mintItemNFT(uint256 itemId) external playerExists itemExists(itemId) returns (uint256 tokenId) {
        Item storage item;
        for (uint256 i = 0; i < playerItems[msg.sender].length; i++) {
            if (playerItems[msg.sender][i].id == itemId) {
                item = playerItems[msg.sender][i];
                break;
            }
        }
        
        tokenId = nextTokenId++;
        _mint(msg.sender, tokenId);
        
        // สร้าง metadata URI
        string memory json = string(abi.encodePacked(
            '{"name":"', item.name, '",',
            '"description":"', item.name, ' - ', item.rarity, ' ', item.itemType, '",',
            '"attributes":[',
            '{"trait_type":"Type","value":"', item.itemType, '"},',
            '{"trait_type":"Rarity","value":"', item.rarity, '"},',
            '{"trait_type":"Power","value":', item.power.toString(), '}',
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
            require(keccak256(bytes(areas[i])) != keccak256(bytes(areaName)), "Area already exists");
        }
        
        areas.push(areaName);
    }

    function addMonster(
        uint256 id,
        string calldata name,
        uint256 hp,
        uint256 reward,
        string calldata monsterType,
        string calldata area
    ) external onlyOwner {
        _addMonster(id, name, hp, reward, monsterType, area);
    }

    function setBaseURI(string calldata baseURI_) external onlyOwner {
        baseURI = baseURI_;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    // ฟังก์ชันภายใน
    function _addMonster(
        uint256 id,
        string memory name,
        uint256 hp,
        uint256 reward,
        string memory monsterType,
        string memory area
    ) internal {
        require(monsters[id].id == 0, "Monster ID already exists");
        
        bool areaExists = false;
        for (uint256 i = 0; i < areas.length; i++) {
            if (keccak256(bytes(areas[i])) == keccak256(bytes(area))) {
                areaExists = true;
                break;
            }
        }
        require(areaExists, "Area does not exist");
        
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
        uint256 power = (rarityIndex + 1) * 5;
        uint256 price = (rarityIndex + 1) * 50;
        
        // สร้างชื่อไอเทม
        string memory name = string(abi.encodePacked(rarity, " ", itemType));
        
        // เพิ่มไอเทม
        uint256 itemId = nextItemId++;
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

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        uint256 len = data.length;
        if (len == 0) return "";

        // output length: 4 * ((len + 2) / 3)
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

