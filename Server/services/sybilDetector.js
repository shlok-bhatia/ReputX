/**
 * Sybil Detection Rules:
 *  1. Wallet age < 30 days with no ENS name
 *  2. All transactions go to/from the same single address
 *  3. Zero DAO activity and zero NFT holdings
 *  4. Transaction timestamps at uniform intervals (scripted)
 *  5. Wallet funded directly from known faucet or mixer
 *
 * Risk Levels:
 *  HIGH   → score capped at 100, profile flagged
 *  MEDIUM → 25% score penalty, badge blocked
 *  LOW    → no penalty, monitoring flag set
 *  NONE   → clean
 */

const KNOWN_MIXERS = new Set([
  "0xd90e2f925da726b50c4ed8d0fb90ad053324f31b", // Tornado Cash 0.1 ETH
  "0x910cbd523d972eb0a6f4cae4618ad62622b39dbf", // Tornado Cash 1 ETH
  "0xa160cdab225685da1d56aa342ad8841c3b53f291", // Tornado Cash 10 ETH
  "0xfd8610d20aa15b7b2e3be39b396a1bc3516c7144", // Tornado Cash 100 ETH
]);

const KNOWN_FAUCETS = new Set([
  "0x4f3a120e72c76c22ae802d129f599bfdbc31cb81",
]);

/**
 * Check if transactions come from a mixer or faucet
 */
function checkFundingSource(received) {
  return received.some(
    (tx) =>
      KNOWN_MIXERS.has(tx.from?.toLowerCase()) ||
      KNOWN_FAUCETS.has(tx.from?.toLowerCase())
  );
}

/**
 * Check if all tx targets are the same single address
 */
function checkSingleTarget(sent) {
  if (sent.length < 3) return false;
  const targets = new Set(sent.map((tx) => tx.to?.toLowerCase()).filter(Boolean));
  return targets.size === 1;
}

/**
 * Check for uniform timestamp intervals (bot scripting signal)
 * Looks for 5+ consecutive txns with the same gap (±5s tolerance)
 */
function checkUniformTimestamps(transactions) {
  const all = [...transactions.sent, ...transactions.received];
  if (all.length < 5) return false;

  const timestamps = all
    .map((tx) => tx.metadata?.blockTimestamp)
    .filter(Boolean)
    .map((ts) => new Date(ts).getTime())
    .sort((a, b) => a - b);

  if (timestamps.length < 5) return false;

  let uniformCount = 0;
  const gaps = timestamps.slice(1).map((ts, i) => ts - timestamps[i]);
  const referenceGap = gaps[0];

  for (const gap of gaps) {
    if (Math.abs(gap - referenceGap) < 5000) uniformCount++;
    else break;
  }

  return uniformCount >= 4;
}

/**
 * Main sybil detection function
 * @param {object} data - wallet signals
 * @returns {{ risk: 'NONE'|'LOW'|'MEDIUM'|'HIGH', flags: string[] }}
 */
export function detectSybil(data) {
  const {
    walletAgeDays,
    ensName,
    transactions,
    daoVotes,
    nftData,
  } = data;

  const flags = [];

  // Rule 1: Very new wallet with no ENS
  if (walletAgeDays !== null && walletAgeDays < 30 && !ensName) {
    flags.push("NEW_WALLET_NO_ENS");
  }

  // Rule 2: All transactions to a single address
  if (transactions?.sent?.length >= 3 && checkSingleTarget(transactions.sent)) {
    flags.push("SINGLE_TARGET_TRANSACTIONS");
  }

  // Rule 3: Zero DAO activity + zero NFTs
  if (daoVotes === 0 && nftData?.total === 0) {
    flags.push("ZERO_ACTIVITY");
  }

  // Rule 4: Scripted uniform transaction pattern
  if (transactions && checkUniformTimestamps(transactions)) {
    flags.push("UNIFORM_TX_PATTERN");
  }

  // Rule 5: Funded from mixer or faucet
  if (transactions?.received && checkFundingSource(transactions.received)) {
    flags.push("MIXER_OR_FAUCET_FUNDING");
  }

  // Determine risk level
  let risk = "NONE";

  const highRiskFlags = ["MIXER_OR_FAUCET_FUNDING", "UNIFORM_TX_PATTERN", "SINGLE_TARGET_TRANSACTIONS"];
  const mediumRiskFlags = ["NEW_WALLET_NO_ENS", "ZERO_ACTIVITY"];

  const hasHighRisk = flags.some((f) => highRiskFlags.includes(f));
  const hasMediumRisk = flags.some((f) => mediumRiskFlags.includes(f));
  const multipleFlags = flags.length >= 3;

  if (hasHighRisk || multipleFlags) risk = "HIGH";
  else if (hasMediumRisk || flags.length >= 2) risk = "MEDIUM";
  else if (flags.length === 1) risk = "LOW";

  return { risk, flags };
}

export default { detectSybil };