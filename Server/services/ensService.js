import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider(
  `https://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
);

/**
 * Resolve ENS name from a wallet address (reverse lookup)
 */
export async function resolveENS(address) {
  try {
    const ensName = await provider.lookupAddress(address);
    return ensName || null;
  } catch (err) {
    console.error("[ENSService] resolveENS error:", err.message);
    return null;
  }
}

/**
 * Resolve address from ENS name (forward lookup)
 */
export async function resolveAddress(ensName) {
  try {
    const address = await provider.resolveName(ensName);
    return address || null;
  } catch (err) {
    console.error("[ENSService] resolveAddress error:", err.message);
    return null;
  }
}

export default { resolveENS, resolveAddress };