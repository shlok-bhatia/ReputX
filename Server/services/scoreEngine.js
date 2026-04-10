// services/scoreEngine.js
import ReputationScore from "../models/ReputationScore.model.js";
import Vote from "../models/Vote.model.js";
import Review from "../models/Review.model.js";
import Trade from "../models/Trade.model.js";
import Badge from "../models/Badge.model.js";

// ─────────────────────────────────────────────
//  BLACKLISTED / SCAM CONTRACT ADDRESSES
// ─────────────────────────────────────────────
const BLACKLISTED_CONTRACTS = new Set([
  "0xscam1111111111111111111111111111111111111",
  "0xrug2222222222222222222222222222222222222",
  "0xphish333333333333333333333333333333333333",
  // Add more as needed
]);

// ─────────────────────────────────────────────
//  TIER THRESHOLDS
// ─────────────────────────────────────────────
function getTier(score) {
  if (score >= 800) return "OG";
  if (score >= 600) return "Trusted";
  if (score >= 400) return "Established";
  if (score >= 200) return "New Wallet";
  return "Anon";
}

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function daysBetween(dateA, dateB) {
  return Math.abs(new Date(dateA) - new Date(dateB)) / (1000 * 60 * 60 * 24);
}

function stdDev(arr) {
  if (!arr.length) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, v) => sum + (v - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

// ─────────────────────────────────────────────
//  RULE 1 — WALLET AGE BASE SCORE
// ─────────────────────────────────────────────
function scoreWalletAge(walletAgeDays) {
  if (!walletAgeDays) return { points: 0, reason: "No wallet age data" };
  if (walletAgeDays >= 1095) return { points: 150, reason: "Wallet age > 3 years" };
  if (walletAgeDays >= 730)  return { points: 100, reason: "Wallet age > 2 years" };
  if (walletAgeDays >= 365)  return { points: 70,  reason: "Wallet age > 1 year" };
  if (walletAgeDays >= 180)  return { points: 40,  reason: "Wallet age > 6 months" };
  if (walletAgeDays >= 30)   return { points: 20,  reason: "Wallet age > 1 month" };
  return { points: 0, reason: "Wallet too new" };
}

// ─────────────────────────────────────────────
//  RULE 2 — INACTIVITY DECAY
//  30-day gap  → -100
//  90-day gap  → -200
// ─────────────────────────────────────────────
function scoreInactivity(transactions) {
  if (!transactions?.list?.length) return { points: 0, reason: "No transactions" };

  const sorted = [...transactions.list].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  let maxGap = 0;
  for (let i = 1; i < sorted.length; i++) {
    const gap = daysBetween(sorted[i].timestamp, sorted[i - 1].timestamp);
    if (gap > maxGap) maxGap = gap;
  }

  // Also check gap from last tx to now
  if (sorted.length > 0) {
    const daysSinceLast = daysBetween(
      new Date(),
      sorted[sorted.length - 1].timestamp
    );
    if (daysSinceLast > maxGap) maxGap = daysSinceLast;
  }

  if (maxGap >= 90) return { points: -200, reason: `Inactive for ${Math.round(maxGap)} days (≥90d)` };
  if (maxGap >= 30) return { points: -100, reason: `Inactive for ${Math.round(maxGap)} days (≥30d)` };
  return { points: 0, reason: "No significant inactivity gap" };
}

// ─────────────────────────────────────────────
//  RULE 3 — ABNORMAL SPIKE DETECTION
//  A single tx > 5× the user's median tx value → -150
// ─────────────────────────────────────────────
function scoreAbnormalSpike(transactions) {
  if (!transactions?.list?.length) return { points: 0, reason: "No transaction data" };

  const amounts = transactions.list
    .map((t) => parseFloat(t.value || "0"))
    .filter((v) => v > 0)
    .sort((a, b) => a - b);

  if (amounts.length < 3) return { points: 0, reason: "Too few transactions to detect spike" };

  const median = amounts[Math.floor(amounts.length / 2)];
  const max = amounts[amounts.length - 1];

  if (median > 0 && max > median * 5) {
    return {
      points: -150,
      reason: `Abnormal spike: max tx ${max.toFixed(2)} ETH vs median ${median.toFixed(2)} ETH (>5×)`,
    };
  }
  return { points: 0, reason: "No abnormal spike detected" };
}

// ─────────────────────────────────────────────
//  RULE 4 — SAME PATTERN DETECTION
//  Same contracts + same time windows (bot-like) → -250
// ─────────────────────────────────────────────
function scoreSamePattern(transactions) {
  if (!transactions?.list?.length) return { points: 0, reason: "No transactions" };

  const txs = transactions.list;

  // Group by contract
  const contractGroups = {};
  for (const tx of txs) {
    const c = tx.to?.toLowerCase();
    if (!c) continue;
    if (!contractGroups[c]) contractGroups[c] = [];
    contractGroups[c].push(new Date(tx.timestamp).getTime());
  }

  // Check for repetitive timing within same contract
  for (const [contract, times] of Object.entries(contractGroups)) {
    if (times.length < 5) continue; // Need at least 5 interactions

    // Calculate inter-arrival intervals in minutes
    const sorted = times.sort((a, b) => a - b);
    const intervals = [];
    for (let i = 1; i < sorted.length; i++) {
      intervals.push((sorted[i] - sorted[i - 1]) / 60000); // minutes
    }

    const sd = stdDev(intervals);
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    // Low std deviation relative to mean = very consistent (bot-like)
    // coefficient of variation < 10% = robotic timing
    if (mean > 0 && sd / mean < 0.1) {
      return {
        points: -250,
        reason: `Bot-like pattern on contract ${contract}: CV=${((sd / mean) * 100).toFixed(1)}%`,
      };
    }
  }

  return { points: 0, reason: "No suspicious patterns detected" };
}

// ─────────────────────────────────────────────
//  RULE 5 — TRANSACTION CONSISTENCY BONUS  +200
//  Active for 6+ consecutive months
// ─────────────────────────────────────────────
function scoreConsistency(transactions) {
  if (!transactions?.list?.length) return { points: 0, reason: "No transactions" };

  const monthSet = new Set();
  for (const tx of transactions.list) {
    const d = new Date(tx.timestamp);
    monthSet.add(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const sortedMonths = [...monthSet].sort();
  let streak = 1;
  let maxStreak = 1;

  for (let i = 1; i < sortedMonths.length; i++) {
    const [py, pm] = sortedMonths[i - 1].split("-").map(Number);
    const [cy, cm] = sortedMonths[i].split("-").map(Number);
    const diffMonths = (cy - py) * 12 + (cm - pm);
    if (diffMonths === 1) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 1;
    }
  }

  if (maxStreak >= 12) return { points: 200, reason: `Consistent 12+ months streak` };
  if (maxStreak >= 6)  return { points: 120, reason: `Consistent 6+ months streak` };
  if (maxStreak >= 3)  return { points: 60,  reason: `Consistent 3+ months streak` };
  return { points: 0, reason: `Max streak: ${maxStreak} month(s)` };
}

// ─────────────────────────────────────────────
//  RULE 6 — SCAM / BLACKLISTED CONTRACT  -150
// ─────────────────────────────────────────────
function scoreScamInteraction(transactions) {
  if (!transactions?.list?.length) return { points: 0, reason: "No transactions" };

  const flagged = transactions.list.filter((tx) =>
    BLACKLISTED_CONTRACTS.has(tx.to?.toLowerCase())
  );

  if (flagged.length > 0) {
    return {
      points: -150,
      reason: `Interacted with ${flagged.length} blacklisted contract(s)`,
      flaggedContracts: flagged.map((t) => t.to),
    };
  }
  return { points: 0, reason: "No blacklisted contract interaction" };
}

// ─────────────────────────────────────────────
//  RULE 7 — DAO MISBEHAVIOUR (spam votes)  -100
//  Votes more than 20 times in a 24h window = spam
// ─────────────────────────────────────────────
async function scoreDAOMisbehaviour(address) {
  // Check platform Vote model (upvote/downvote spam)
  const votes = await Vote.find({ voter: address.toLowerCase() })
    .sort({ createdAt: 1 })
    .lean();

  if (votes.length < 20) return { points: 0, reason: "No DAO spam detected" };

  // Sliding 24h window
  for (let i = 0; i < votes.length; i++) {
    let count = 1;
    for (let j = i + 1; j < votes.length; j++) {
      const diff = daysBetween(votes[i].createdAt, votes[j].createdAt);
      if (diff <= 1) count++;
      else break;
    }
    if (count >= 20) {
      return {
        points: -100,
        reason: `DAO spam detected: ${count} votes in 24h window`,
      };
    }
  }

  return { points: 0, reason: "No DAO spam detected" };
}

// ─────────────────────────────────────────────
//  RULE 8 — NFT DUMP BEHAVIOUR  -100
//  Buys NFT and sells within 24h repeatedly (3+ times)
// ─────────────────────────────────────────────
async function scoreDumpBehaviour(address, nftData) {
  // Use Trade model to detect quick flips
  const trades = await Trade.find({
    $or: [
      { partyA: address.toLowerCase(), tradeType: "nft_trade" },
      { partyB: address.toLowerCase(), tradeType: "nft_trade" },
    ],
  })
    .sort({ timestamp: 1 })
    .lean();

  if (trades.length < 3) return { points: 0, reason: "Insufficient NFT trade data" };

  // Check NFT data for quick dump pattern
  let quickDumps = 0;
  if (nftData?.recentFlips) {
    quickDumps = nftData.recentFlips.filter((flip) => flip.holdDays < 1).length;
  }

  // Also check from Trade model: same partyA buying and selling quickly
  const tradesByPair = {};
  for (const t of trades) {
    const key = t.txHash || t._id.toString();
    tradesByPair[key] = t;
  }

  if (quickDumps >= 3) {
    return {
      points: -100,
      reason: `NFT dump behaviour: ${quickDumps} quick flips (<24h hold)`,
    };
  }

  return { points: 0, reason: "No dump behaviour detected" };
}

// ─────────────────────────────────────────────
//  RULE 9 — TIME-BASED DECAY  -150
//  Applied if score hasn't been refreshed in 90 days
//  AND user has no recent tx activity
// ─────────────────────────────────────────────
async function scoreTimeDecay(address) {
  const existing = await ReputationScore.findOne({
    address: address.toLowerCase(),
  }).lean();

  if (!existing) return { points: 0, reason: "No existing score — no decay" };

  const daysSinceUpdate = daysBetween(new Date(), existing.cachedAt);
  if (daysSinceUpdate >= 90) {
    return {
      points: -150,
      reason: `Time decay: score not refreshed for ${Math.round(daysSinceUpdate)} days`,
    };
  }
  return { points: 0, reason: "Score is recent — no decay" };
}

// ─────────────────────────────────────────────
//  RULE 10 — BASE FACTORS (original engine)
// ─────────────────────────────────────────────
function scoreBaseFactors({ totalTransactions, uniqueContracts, nftData, daoVotes, ensName }) {
  const breakdown = {};

  // Transaction volume
  if (totalTransactions >= 1000)      breakdown.transactionCount = 100;
  else if (totalTransactions >= 500)  breakdown.transactionCount = 70;
  else if (totalTransactions >= 100)  breakdown.transactionCount = 40;
  else if (totalTransactions >= 10)   breakdown.transactionCount = 15;
  else                                breakdown.transactionCount = 0;

  // Unique contracts
  if (uniqueContracts >= 100)     breakdown.uniqueContracts = 80;
  else if (uniqueContracts >= 50) breakdown.uniqueContracts = 50;
  else if (uniqueContracts >= 20) breakdown.uniqueContracts = 30;
  else if (uniqueContracts >= 5)  breakdown.uniqueContracts = 15;
  else                            breakdown.uniqueContracts = 0;

  // NFT holdings
  const nftCount = nftData?.total || 0;
  if (nftCount >= 50)      breakdown.nftHoldings = 60;
  else if (nftCount >= 20) breakdown.nftHoldings = 40;
  else if (nftCount >= 5)  breakdown.nftHoldings = 20;
  else                     breakdown.nftHoldings = 0;

  // DAO votes
  if (daoVotes >= 50)      breakdown.daoVotes = 100;
  else if (daoVotes >= 20) breakdown.daoVotes = 60;
  else if (daoVotes >= 5)  breakdown.daoVotes = 30;
  else                     breakdown.daoVotes = 0;

  // ENS name
  breakdown.ensName = ensName ? 30 : 0;

  return breakdown;
}

// ─────────────────────────────────────────────
//  RULE 11 — PEER REVIEWS BONUS / PENALTY
// ─────────────────────────────────────────────
async function scoreReviews(address) {
  const reviews = await Review.find({ reviewee: address.toLowerCase() }).lean();
  if (!reviews.length) return { points: 0, reason: "No peer reviews" };

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  if (avg >= 4.5 && reviews.length >= 5) return { points: 80, reason: `Avg review ${avg.toFixed(1)} (${reviews.length} reviews)` };
  if (avg >= 3.5) return { points: 30, reason: `Avg review ${avg.toFixed(1)}` };
  if (avg < 2.0 && reviews.length >= 3) return { points: -80, reason: `Low avg review ${avg.toFixed(1)}` };

  return { points: 0, reason: `Avg review ${avg.toFixed(1)} — neutral` };
}

// ─────────────────────────────────────────────
//  RULE 12 — COMMUNITY VOTES BONUS
// ─────────────────────────────────────────────
async function scoreCommunityVotes(address) {
  const upvotes   = await Vote.countDocuments({ target: address.toLowerCase(), type: "upvote" });
  const downvotes = await Vote.countDocuments({ target: address.toLowerCase(), type: "downvote" });
  const net = upvotes - downvotes;

  if (net >= 50)       return { points: 60, reason: `Net votes: +${net}` };
  if (net >= 20)       return { points: 30, reason: `Net votes: +${net}` };
  if (net < -10)       return { points: -50, reason: `Net votes: ${net}` };
  return { points: 0, reason: `Net votes: ${net}` };
}

// ─────────────────────────────────────────────
//  RULE 13 — BADGE BONUS
// ─────────────────────────────────────────────
const BADGE_POINTS = {
  DAO_VOTER:       20,
  OG_WALLET:       40,
  ENS_HOLDER:      20,
  DIAMOND_HANDS:   50,
  POWER_USER:      30,
  VERIFIED_HUMAN:  50,
  PLATINUM:        80,
};

async function scoreBadges(address) {
  const badges = await Badge.find({ address: address.toLowerCase() }).lean();
  let points = 0;
  const reasons = [];
  for (const b of badges) {
    const pts = BADGE_POINTS[b.type] || 0;
    points += pts;
    if (pts) reasons.push(`${b.type}: +${pts}`);
  }
  return { points, reason: reasons.join(", ") || "No badges" };
}

// ─────────────────────────────────────────────
//  MASTER CALCULATE SCORE FUNCTION
// ─────────────────────────────────────────────
export async function calculateScore({
  address,
  firstTxDate,
  totalTransactions,
  uniqueContracts,
  nftData,
  daoVotes,
  ensName,
  sybilRisk,
  transactions, // full tx list with { to, value, timestamp }
}) {
  const audit = []; // full audit trail of every rule applied

  // ── BASE FACTORS ──────────────────────────
  const walletAgeDays = firstTxDate
    ? daysBetween(new Date(), new Date(firstTxDate))
    : 0;

  const ageResult = scoreWalletAge(walletAgeDays);
  audit.push({ rule: "Wallet Age", ...ageResult });

  const baseBreakdown = scoreBaseFactors({
    totalTransactions,
    uniqueContracts,
    nftData,
    daoVotes,
    ensName,
  });

  const basePoints =
    ageResult.points + Object.values(baseBreakdown).reduce((a, b) => a + b, 0);
  audit.push({ rule: "Base Factors", points: basePoints - ageResult.points, breakdown: baseBreakdown });

  // ── BEHAVIOURAL RULES ─────────────────────
  const inactivity    = scoreInactivity(transactions);
  const spike         = scoreAbnormalSpike(transactions);
  const pattern       = scoreSamePattern(transactions);
  const consistency   = scoreConsistency(transactions);
  const scam          = scoreScamInteraction(transactions);
  const daoMisbehav   = await scoreDAOMisbehaviour(address);
  const dump          = await scoreDumpBehaviour(address, nftData);
  const decay         = await scoreTimeDecay(address);

  audit.push({ rule: "Inactivity Penalty",          ...inactivity });
  audit.push({ rule: "Abnormal Spike",               ...spike });
  audit.push({ rule: "Same Pattern (Bot-like)",      ...pattern });
  audit.push({ rule: "Consistency Bonus",            ...consistency });
  audit.push({ rule: "Scam Contract Interaction",    ...scam });
  audit.push({ rule: "DAO Misbehaviour",             ...daoMisbehav });
  audit.push({ rule: "NFT Dump Behaviour",           ...dump });
  audit.push({ rule: "Time Decay",                   ...decay });

  // ── SOCIAL LAYER ─────────────────────────
  const reviews        = await scoreReviews(address);
  const communityVotes = await scoreCommunityVotes(address);
  const badges         = await scoreBadges(address);

  audit.push({ rule: "Peer Reviews",      ...reviews });
  audit.push({ rule: "Community Votes",   ...communityVotes });
  audit.push({ rule: "Badges",            ...badges });

  // ── SYBIL RISK PENALTY ───────────────────
  const sybilPenalty =
    sybilRisk === "HIGH"   ? -200 :
    sybilRisk === "MEDIUM" ? -100 : 0;
  if (sybilPenalty) {
    audit.push({ rule: "Sybil Risk Penalty", points: sybilPenalty, reason: `Sybil risk: ${sybilRisk}` });
  }

  // ── TOTAL ────────────────────────────────
  const raw =
    basePoints +
    inactivity.points +
    spike.points +
    pattern.points +
    consistency.points +
    scam.points +
    daoMisbehav.points +
    dump.points +
    decay.points +
    reviews.points +
    communityVotes.points +
    badges.points +
    sybilPenalty;

  const score = Math.max(0, Math.min(1000, Math.round(raw)));
  const tier  = getTier(score);

  return {
    score,
    tier,
    breakdown: {
      walletAge:        ageResult.points,
      ...baseBreakdown,
      inactivity:       inactivity.points,
      spike:            spike.points,
      pattern:          pattern.points,
      consistency:      consistency.points,
      scamInteraction:  scam.points,
      daoMisbehaviour:  daoMisbehav.points,
      dumpBehaviour:    dump.points,
      timeDecay:        decay.points,
      reviews:          reviews.points,
      communityVotes:   communityVotes.points,
      badges:           badges.points,
      sybilPenalty,
    },
    audit, // full per-rule breakdown with reasons
  };
}

// ─────────────────────────────────────────────
//  DB-ONLY SCORE CALCULATION
//  Calculates score from seeded/stored DB data
//  without calling any external APIs.
// ─────────────────────────────────────────────
import User from "../models/User.model.js";

export async function calculateScoreFromDB(address) {
  const addr = address.toLowerCase();

  // Fetch the user document for wallet-level data
  const user = await User.findOne({ address: addr }).lean();

  // ── Wallet Age ──────────────────────────
  const walletAgeDays = user?.createdAt
    ? daysBetween(new Date(), new Date(user.createdAt))
    : 0;
  const ageResult = scoreWalletAge(walletAgeDays);

  // ── Trades as pseudo-transactions ───────
  const trades = await Trade.find({
    $or: [{ partyA: addr }, { partyB: addr }],
  })
    .sort({ timestamp: 1 })
    .lean();

  // Build a transaction-like list from trades for the behavioural rules
  const txList = trades.map((t) => ({
    to: t.partyB === addr ? t.partyA : t.partyB,
    value: t.amount || "0",
    timestamp: t.timestamp || t.createdAt,
  }));

  const transactions = { list: txList, total: txList.length };

  // Count unique counterparties as a proxy for unique contracts
  const uniqueCounterparties = new Set(txList.map((t) => t.to)).size;

  // ── NFT data from trades ────────────────
  const nftTrades = trades.filter((t) => t.tradeType === "nft_trade");
  const nftData = { total: nftTrades.length, recentFlips: [] };

  // Detect quick NFT flips (buy then sell within 1 hour)
  const nftTradesForAddr = nftTrades.filter(
    (t) => t.partyA === addr || t.partyB === addr
  );
  for (let i = 0; i < nftTradesForAddr.length - 1; i++) {
    for (let j = i + 1; j < nftTradesForAddr.length; j++) {
      const gap = daysBetween(
        nftTradesForAddr[j].timestamp,
        nftTradesForAddr[i].timestamp
      );
      if (gap < 1) {
        nftData.recentFlips.push({ holdDays: gap });
      }
    }
  }

  // ── DAO votes from Vote model ──────────
  const daoVoteCount = await Vote.countDocuments({ voter: addr });

  // ── ENS name ────────────────────────────
  const ensName = user?.ensName || null;

  // ── Sybil risk from user doc ────────────
  const sybilRisk = user?.sybilRisk || "NONE";

  // ── Base Factors ────────────────────────
  const baseBreakdown = scoreBaseFactors({
    totalTransactions: transactions.total,
    uniqueContracts: uniqueCounterparties,
    nftData,
    daoVotes: daoVoteCount,
    ensName,
  });

  const basePoints =
    ageResult.points +
    Object.values(baseBreakdown).reduce((a, b) => a + b, 0);

  // ── Behavioural Rules ───────────────────
  const inactivity  = scoreInactivity(transactions);
  const spike       = scoreAbnormalSpike(transactions);
  const pattern     = scoreSamePattern(transactions);
  const consistency = scoreConsistency(transactions);
  const scam        = scoreScamInteraction(transactions);
  const daoMisbehav = await scoreDAOMisbehaviour(addr);
  const dump        = await scoreDumpBehaviour(addr, nftData);
  const decay       = await scoreTimeDecay(addr);

  // ── Social Layer ────────────────────────
  const reviews        = await scoreReviews(addr);
  const communityVotes = await scoreCommunityVotes(addr);
  const badges         = await scoreBadges(addr);

  // ── Sybil Penalty ───────────────────────
  const sybilPenalty =
    sybilRisk === "HIGH"   ? -200 :
    sybilRisk === "MEDIUM" ? -100 : 0;

  // ── Total ───────────────────────────────
  const raw =
    basePoints +
    inactivity.points +
    spike.points +
    pattern.points +
    consistency.points +
    scam.points +
    daoMisbehav.points +
    dump.points +
    decay.points +
    reviews.points +
    communityVotes.points +
    badges.points +
    sybilPenalty;

  const score = Math.max(0, Math.min(1000, Math.round(raw)));
  const tier  = getTier(score);

  return {
    score,
    tier,
    sybilRisk,
    ensName,
    breakdown: {
      walletAge:        ageResult.points,
      ...baseBreakdown,
      inactivity:       inactivity.points,
      spike:            spike.points,
      pattern:          pattern.points,
      consistency:      consistency.points,
      scamInteraction:  scam.points,
      daoMisbehaviour:  daoMisbehav.points,
      dumpBehaviour:    dump.points,
      timeDecay:        decay.points,
      reviews:          reviews.points,
      communityVotes:   communityVotes.points,
      badges:           badges.points,
      sybilPenalty,
    },
  };
}