// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// Custom errors for better gas efficiency and debugging
error BatchSizeTooLarge();
error BatchSizeEmpty();
error TokenDoesNotExist();

contract AdventureNFT is ERC721, Ownable, ReentrancyGuard {
    uint256 private _tokenIds;
    mapping(uint256 => string) private _tokenURIs;
    uint256 public constant BATCH_MINT_LIMIT = 10;

    // Events
    event NFTMinted(address indexed to, uint256 tokenId, string tokenURI);
    event BatchMinted(address indexed to, uint256[] tokenIds);

    constructor(address initialOwner) ERC721("AdventureNFT", "ADVNFT") Ownable(initialOwner) {}

    // Mint a single NFT with explicit error handling
    function mintNFT(address recipient, string memory tokenURI) public returns (uint256) {
        uint256 newItemId = _tokenIds++;
        _mint(recipient, newItemId);
        _tokenURIs[newItemId] = tokenURI;
        
        emit NFTMinted(recipient, newItemId, tokenURI);
        return newItemId;
    }

    // Mint multiple NFTs with explicit error handling
    function batchMintNFT(address recipient, string[] memory tokenURIs) public nonReentrant returns (uint256[] memory) {
        // Use custom errors instead of require for better gas efficiency
        if (tokenURIs.length == 0) revert BatchSizeEmpty();
        if (tokenURIs.length > BATCH_MINT_LIMIT) revert BatchSizeTooLarge();
        
        uint256[] memory tokenIds = new uint256[](tokenURIs.length);
        
        for (uint256 i = 0; i < tokenURIs.length; i++) {
            uint256 newItemId = _tokenIds++;
            _mint(recipient, newItemId);
            _tokenURIs[newItemId] = tokenURIs[i];
            tokenIds[i] = newItemId;
        }
        
        emit BatchMinted(recipient, tokenIds);
        return tokenIds;
    }

    // Override tokenURI function with explicit error handling
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        if (!_exists(tokenId)) revert TokenDoesNotExist();
        return _tokenURIs[tokenId];
    }

    // Check if token exists
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}

