import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export const revalidate = 0;

// GET /api/nfts?address=<wallet_address> - Get all NFTs for a given address
export async function GET(request: NextRequest) {
    const address = request.nextUrl.searchParams.get('address');

    if (!address) {
        return NextResponse.json({ error: 'Wallet address query parameter is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('nfts')
            .select('*')
            .eq('owner_address', address.toLowerCase())
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching NFTs from Supabase:', error);
            return NextResponse.json({ error: 'Failed to fetch NFTs.' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
}


// POST /api/nfts - Create a new NFT record in the database
// This should be called after a successful mint transaction.
export async function POST(request: Request) {
  const body = await request.json();
  const { tokenId, ownerAddress, contractAddress, chainId, tokenUri } = body;

  if (!tokenId || !ownerAddress || !contractAddress || !chainId) {
    return NextResponse.json({ error: 'Missing required fields: tokenId, ownerAddress, contractAddress, chainId' }, { status: 400 });
  }

  // Fetch metadata from tokenUri
  let metadata = {};
  if (tokenUri) {
    try {
      const response = await fetch(tokenUri);
      if (response.ok) {
        metadata = await response.json();
      }
    } catch (e) {
      console.warn(`Could not fetch metadata from ${tokenUri}:`, e);
    }
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('nfts')
      .insert({
        token_id: tokenId,
        owner_address: ownerAddress.toLowerCase(),
        contract_address: contractAddress.toLowerCase(),
        chain_id: chainId,
        token_uri: tokenUri,
        metadata: metadata,
      })
      .select()
      .single();

    if (error) {
      // Handle potential unique constraint violation gracefully
      if (error.code === '23505') { // unique_violation
        return NextResponse.json({ error: 'NFT already exists.' }, { status: 409 });
      }
      console.error('Error creating NFT record in Supabase:', error);
      return NextResponse.json({ error: 'Failed to create NFT record.' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
  }
}

// DELETE /api/nfts - Delete an NFT record from the database
// This should be called after a successful burn transaction.
export async function DELETE(request: Request) {
    const body = await request.json();
    const { tokenId, contractAddress, chainId } = body;

    if (!tokenId || !contractAddress || !chainId) {
        return NextResponse.json({ error: 'Missing required fields: tokenId, contractAddress, chainId' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('nfts')
            .delete()
            .match({
                token_id: tokenId,
                contract_address: contractAddress.toLowerCase(),
                chain_id: chainId,
            });

        if (error) {
            console.error('Error deleting NFT record from Supabase:', error);
            return NextResponse.json({ error: 'Failed to delete NFT record.' }, { status: 500 });
        }

        return NextResponse.json({ message: 'NFT record deleted successfully.' }, { status: 200 });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return NextResponse.json({ error: 'An unexpected server error occurred.' }, { status: 500 });
    }
}
