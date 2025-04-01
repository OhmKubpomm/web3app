import type { FC } from "react";

interface NFT {
  id: string;
  name: string;
  image: string;
  description: string;
  price: number;
}

interface NFTDisplayProps {
  nft: NFT;
}

const NFTDisplay: FC<NFTDisplayProps> = ({ nft }) => {
  return (
    <div className="nft-card">
      <img
        src={`/images/nfts/${nft.image || "default-nft.png"}`}
        alt={`NFT: ${nft.name}`}
        className="nft-image"
      />
      <div className="nft-details">
        <h3>{nft.name}</h3>
        <p>{nft.description}</p>
        <p>Price: {nft.price} ETH</p>
      </div>
    </div>
  );
};

export default NFTDisplay;
