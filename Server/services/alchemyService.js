import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

/**
 * Get all transactions for a wallet address
 */
export async function getTransactions(address) {
  try {
    const [sent, received] = await Promise.all([
      alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: ["external", "erc20", "erc721", "erc1155"],
        withMetadata: true,
        maxCount: 1000,
      }),
      alchemy.core.getAssetTransfers({
        toAddress: address,
        category: ["external", "erc20", "erc721", "erc1155"],
        withMetadata: true,
        maxCount: 1000,
      }),
    ]);

    return {
      sent: sent.transfers || [],
      received: received.transfers || [],
      total: (sent.transfers?.length || 0) + (received.transfers?.length || 0),
    };
  } catch (err) {
    console.error("[AlchemyService] getTransactions error:", err.message);
    return { sent: [], received: [], total: 0 };
  }
}

/**
 * Get NFT holdings for a wallet
 */
export async function getNFTs(address) {
  try {
    const response = await alchemy.nft.getNftsForOwner(address, {
      omitMetadata: false,
    });

    const BLUE_CHIP_CONTRACTS = new Set([
      "0xb47e3cd837ddf8e4c57f05d70ab865de6e193bbb", // CryptoPunks
      "0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d", // BAYC
      "0x60e4d786628fea6478f785a6d7e704777c86a7c6", // MAYC
      "0xed5af388653567af2f388e6224dc7c4b3241c544", // Azuki
      "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e", // Doodles
    ]);

    const blueChipCount = (response.ownedNfts || []).filter((nft) =>
      BLUE_CHIP_CONTRACTS.has(nft.contract.address.toLowerCase())
    ).length;

    return {
      total: response.totalCount || 0,
      blueChip: blueChipCount,
      nfts: response.ownedNfts || [],
    };
  } catch (err) {
    console.error("[AlchemyService] getNFTs error:", err.message);
    return { total: 0, blueChip: 0, nfts: [] };
  }
}

/**
 * Get token balances for a wallet
 */
export async function getTokenBalances(address) {
  try {
    const response = await alchemy.core.getTokenBalances(address);
    return response.tokenBalances || [];
  } catch (err) {
    console.error("[AlchemyService] getTokenBalances error:", err.message);
    return [];
  }
}

/**
 * Get wallet creation block / first transaction timestamp
 */
export async function getWalletAge(address) {
  try {
    const txns = await alchemy.core.getAssetTransfers({
      toAddress: address,
      category: ["external"],
      withMetadata: true,
      maxCount: 1,
      order: "asc",
    });

    if (!txns.transfers?.length) return null;

    const firstTx = txns.transfers[0];
    return firstTx.metadata?.blockTimestamp
      ? new Date(firstTx.metadata.blockTimestamp)
      : null;
  } catch (err) {
    console.error("[AlchemyService] getWalletAge error:", err.message);
    return null;
  }
}

/**
 * Get unique contract addresses the wallet has interacted with
 */
export async function getUniqueContracts(address) {
  try {
    const { sent } = await getTransactions(address);
    const contracts = new Set(
      sent
        .filter((tx) => tx.to && tx.category !== "external")
        .map((tx) => tx.to.toLowerCase())
    );
    return contracts.size;
  } catch (err) {
    console.error("[AlchemyService] getUniqueContracts error:", err.message);
    return 0;
  }
}

/**
 * Check if two addresses have ever transacted with each other on Ethereum.
 * Checks A -> B and B -> A.
 */
export async function checkMutualTransfers(addressA, addressB) {
  try {
    const [aToB, bToA] = await Promise.all([
      alchemy.core.getAssetTransfers({
        fromAddress: addressA,
        toAddress: addressB,
        category: ["external", "erc20", "erc721", "erc1155"],
        withMetadata: true,
        maxCount: 1,
      }),
      alchemy.core.getAssetTransfers({
        fromAddress: addressB,
        toAddress: addressA,
        category: ["external", "erc20", "erc721", "erc1155"],
        withMetadata: true,
        maxCount: 1,
      }),
    ]);

    if (aToB.transfers?.length > 0) {
      return {
        txHash: aToB.transfers[0].hash,
        timestamp: aToB.transfers[0].metadata.blockTimestamp,
        asset: aToB.transfers[0].asset,
        value: aToB.transfers[0].value,
        direction: "A_TO_B"
      };
    }

    if (bToA.transfers?.length > 0) {
      return {
        txHash: bToA.transfers[0].hash,
        timestamp: bToA.transfers[0].metadata.blockTimestamp,
        asset: bToA.transfers[0].asset,
        value: bToA.transfers[0].value,
        direction: "B_TO_A"
      };
    }

    return null;
  } catch (err) {
    console.error("[AlchemyService] checkMutualTransfers error:", err.message);
    return null;
  }
}

export default {
  getTransactions,
  getNFTs,
  getTokenBalances,
  getWalletAge,
  getUniqueContracts,
  checkMutualTransfers,
};