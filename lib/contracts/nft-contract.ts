export const NFTContract = {
  abi: [
    // ERC721 Standard
    "function balanceOf(address owner) view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function safeTransferFrom(address from, address to, uint256 tokenId)",
    "function transferFrom(address from, address to, uint256 tokenId)",
    "function approve(address to, uint256 tokenId)",
    "function getApproved(uint256 tokenId) view returns (address)",
    "function setApprovalForAll(address operator, bool approved)",
    "function isApprovedForAll(address owner, address operator) view returns (bool)",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function tokenURI(uint256 tokenId) view returns (string)",
    "function totalSupply() view returns (uint256)",

    // Custom NFT Functions
    "function mintNFT(address recipient, string memory tokenURI) returns (uint256)",
    "function burn(uint256 tokenId)",

    // Events
    "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
    "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  ],

  // เมตาดาต้าสำหรับ NFT
  metadata: {
    name: "Adventure Clicker NFT",
    description: "NFT items from the Adventure Clicker game",
    image: "https://adventure-clicker.vercel.app/logo.png",
  },
}

