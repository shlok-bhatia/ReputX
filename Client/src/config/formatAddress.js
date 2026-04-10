/**
 * Truncates an Ethereum address: 0x1234...5678
 * @param {string} address
 * @param {number} prefixLen
 * @param {number} suffixLen
 */
export function formatAddress(address, prefixLen = 6, suffixLen = 4) {
  if (!address) return '';
  if (address.length <= prefixLen + suffixLen) return address;
  return `${address.slice(0, prefixLen)}...${address.slice(-suffixLen)}`;
}