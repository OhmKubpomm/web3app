-- Create a dedicated table for caching NFT data from the blockchain.
-- This allows for fast querying of NFT ownership and metadata without constant blockchain calls.

CREATE TABLE IF NOT EXISTS nfts (
  id BIGSERIAL PRIMARY KEY,
  token_id NUMERIC(78, 0) NOT NULL, -- Corresponds to uint256
  owner_address TEXT NOT NULL,
  contract_address TEXT NOT NULL,
  chain_id INTEGER NOT NULL,
  token_uri TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Create a unique constraint on token_id, contract_address, and chain_id
  CONSTRAINT unique_nft_identifier UNIQUE (token_id, contract_address, chain_id)
);

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_nfts_owner_address ON nfts (owner_address);
CREATE INDEX IF NOT EXISTS idx_nfts_contract_address_chain_id ON nfts (contract_address, chain_id);

-- Add a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_nfts_timestamp
BEFORE UPDATE ON nfts
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Add comments to explain the purpose of columns
COMMENT ON COLUMN nfts.token_id IS 'The unique identifier of the NFT on its specific contract (uint256).';
COMMENT ON COLUMN nfts.owner_address IS 'The wallet address of the current owner of the NFT.';
COMMENT ON COLUMN nfts.contract_address IS 'The address of the NFT smart contract.';
COMMENT ON COLUMN nfts.chain_id IS 'The ID of the blockchain where the NFT resides.';
COMMENT ON COLUMN nfts.token_uri IS 'The URI pointing to the NFT''s metadata.';
COMMENT ON COLUMN nfts.metadata IS 'The cached JSON metadata of the NFT.';
