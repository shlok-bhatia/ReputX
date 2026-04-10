/**
 * Scoring Weights (total = 100%)
 *   Wallet age             15%
 *   Transaction count      20%
 *   Unique contracts       15%
 *   NFT holdings (blue)    10%
 *   DAO votes              20%
 *   ENS name owned         10%
 *   No scam interactions   10%
 */

const WEIGHTS = {
  walletAge: 0.15,
  transactionCount: 0.20,
  uniqueContracts: 0.15,
  nftHoldings: 0.10,
  daoVotes: 0.20,
  ensName: 0.10,
  cleanRecord: 0.10,
};

const TIERS = [
  { label: "OG",          min: 801, max: 1000 },
  { label: "Trusted",     min: 601, max: 800 },
  { label: "Established", min: 401, max: 600 },
  { label: "New Wallet",  min: 201, max: 400 },
  { label: "Anon",        min: 0,   max: 200 },
];

/** Cap a raw signal value between 0–1 */
function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Score wallet age (days old → 0–1)
 * Max signal reached at 4 years (1460 days)
 */
function scoreWalletAge(firstTxDate) {
  if (!firstTxDate) return 0;
  const ageMs = Date.now() - new Date(firstTxDate).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return clamp(ageDays / 1460);
}

/**
 * Score transaction count (0–1)
 * Max signal at 1000 txns
 */
function scoreTransactionCount(total) {
  return clamp(total / 1000);
}

/**
 * Score unique contracts interacted with (0–1)
 * Max signal at 200 unique contracts
 */
function scoreUniqueContracts(count) {
  return clamp(count / 200);
}

/**
 * Score NFT holdings (0–1)
 * Blue-chip holdings count 5x more than regular NFTs
 * Max signal at 5 blue-chip OR 50 regular
 */
function scoreNFTHoldings({ blueChip, total }) {
  const weightedScore = (blueChip * 5 + (total - blueChip)) / 75;
  return clamp(weightedScore);
}

/**
 * Score DAO participation (0–1)
 * Max signal at 50 votes
 */
function scoreDAOVotes(totalVotes) {
  return clamp(totalVotes / 50);
}

/**
 * Score ENS name ownership (binary: 0 or 1)
 */
function scoreENS(ensName) {
  return ensName ? 1 : 0;
}

/**
 * Score clean record (no known scam interactions)
 * Pass hasScamInteraction = true to apply penalty
 */
function scoreCleanRecord(hasScamInteraction) {
  return hasScamInteraction ? 0 : 1;
}

/**
 * Get tier label from final score
 */
export function getTier(score) {
  return TIERS.find((t) => score >= t.min && score <= t.max)?.label || "Anon";
}

/**
 * Main scoring function
 * @param {object} data - all raw on-chain signals
 * @returns {{ score, tier, breakdown }}
 */
export function calculateScore(data) {
  const {
    firstTxDate,
    totalTransactions,
    uniqueContracts,
    nftData,
    daoVotes,
    ensName,
    hasScamInteraction,
    sybilRisk,
  } = data;

  const signals = {
    walletAge:        scoreWalletAge(firstTxDate),
    transactionCount: scoreTransactionCount(totalTransactions || 0),
    uniqueContracts:  scoreUniqueContracts(uniqueContracts || 0),
    nftHoldings:      scoreNFTHoldings(nftData || { blueChip: 0, total: 0 }),
    daoVotes:         scoreDAOVotes(daoVotes || 0),
    ensName:          scoreENS(ensName),
    cleanRecord:      scoreCleanRecord(hasScamInteraction || false),
  };

  // Weighted sum → scale to 0–1000
  let rawScore = Object.entries(WEIGHTS).reduce((acc, [key, weight]) => {
    return acc + signals[key] * weight;
  }, 0);

  let score = Math.round(rawScore * 1000);

  // Apply sybil risk caps
  if (sybilRisk === "HIGH")   score = Math.min(score, 100);
  if (sybilRisk === "MEDIUM") score = Math.round(score * 0.75);

  score = Math.min(1000, Math.max(0, score));

  const breakdown = Object.fromEntries(
    Object.entries(signals).map(([key, val]) => [
      key,
      Math.round(val * WEIGHTS[key] * 1000),
    ])
  );

  return {
    score,
    tier: getTier(score),
    breakdown,
    signals,
  };
}

export default { calculateScore, getTier };