// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AdventureAssets
 * @dev An ERC1155 contract for managing various game assets (NFTs).
 */
contract AdventureNFT is ERC1155, Ownable, ReentrancyGuard {
    using Strings for uint256;

    string private _baseUri;

    // A special "access" token ID that users must hold to use certain features.
    uint256 public constant ACCESS_TOKEN_ID = 0;

    // Mapping from token ID to the creator of that token type
    mapping(uint256 => address) public creators;

    event TokenTypeCreated(uint256 indexed id, address indexed creator, string uri);
    event BaseURIChanged(string newUri);

    constructor(
        string memory baseUri,
        address initialOwner
    ) ERC1155(baseUri) Ownable(initialOwner) {
        _baseUri = baseUri;
        // The contract itself is the creator of the access token
        creators[ACCESS_TOKEN_ID] = address(this);
    }

    function uri(uint256 id) public view override returns (string memory) {
        return string(abi.encodePacked(_baseUri, id.toString(), ".json"));
    }

    function setBaseUri(string memory newUri) public onlyOwner {
        _baseUri = newUri;
        emit BaseURIChanged(newUri);
    }

    /**
     * @dev Allows any user to mint the single "access" token.
     * This is a specific token that grants them permissions in the dApp.
     * A user can only hold one of these.
     */
    function mintAccessNFT() public nonReentrant {
        require(balanceOf(msg.sender, ACCESS_TOKEN_ID) == 0, "Already own access token");
        // Mint one ACCESS_TOKEN_ID NFT to the caller.
        _mint(msg.sender, ACCESS_TOKEN_ID, 1, "");
    }

    /**
     * @dev Allows a user to mint new assets. Here we assume token IDs are pre-defined by the admin.
     * The user can mint multiple copies of an asset.
     * @param id The ID of the token type to mint.
     * @param amount The number of tokens to mint.
     */
    function mintAsset(uint256 id, uint256 amount) public nonReentrant {
        require(id != ACCESS_TOKEN_ID, "Cannot mint access token here");
        // Further logic could be added here, e.g., requiring payment or specific items.
        _mint(msg.sender, id, amount, "");
    }

    /**
     * @dev Admin function to mint new tokens of a specific ID to a recipient.
     */
    function adminMint(address to, uint256 id, uint256 amount, bytes memory data) public onlyOwner nonReentrant {
        _mint(to, id, amount, data);
    }

    /**
     * @dev Admin function to mint multiple types of tokens to a single recipient.
     */
    function adminMintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public onlyOwner nonReentrant {
        _mintBatch(to, ids, amounts, data);
    }

    /**
     * @dev Allows a user to burn their own tokens.
     */
    function burn(address from, uint256 id, uint256 amount) public nonReentrant {
        require(from == msg.sender, "Can only burn your own tokens");
        _burn(from, id, amount);
    }

    /**
     * @dev Allows a user to burn multiple types of their own tokens.
     */
    function burnBatch(address from, uint256[] memory ids, uint256[] memory amounts) public nonReentrant {
        require(from == msg.sender, "Can only burn your own tokens");
        _burnBatch(from, ids, amounts);
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal override(ERC1155) {
        super._update(from, to, ids, amounts);
    }
}
