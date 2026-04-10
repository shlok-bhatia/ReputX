// ─────────────────────────────────────────────────────────────────
//  ETHEREALVAULT — MongoDB Seed Data
//  Run with: mongosh etherealvault seed.mongodb.js
//  Or import via: mongoimport / MongoDB Compass
// ─────────────────────────────────────────────────────────────────

// ── ADDRESSES used across all collections ────────────────────────
// 0xALICE  = high reputation, consistent user
// 0xBOB    = mid reputation, some issues
// 0xEVE    = bot/sybil, will get heavy penalties
// 0xDAVE   = new wallet, minimal activity
// 0xSATOSHI= OG wallet, longest history

const ALICE   = "0xalice111111111111111111111111111111111111";
const BOB     = "0xbob2222222222222222222222222222222222222222";
const EVE     = "0xeve3333333333333333333333333333333333333333";
const DAVE    = "0xdave444444444444444444444444444444444444444";
const SATOSHI = "0xsatoshi55555555555555555555555555555555555";
const SCAM    = "0xscam1111111111111111111111111111111111111";

// ════════════════════════════════════════════════════════════════
//  1. REPUTATION SCORES
// ════════════════════════════════════════════════════════════════
db.reputationscores.deleteMany({});
db.reputationscores.insertMany([
  {
    address: ALICE,
    score: 820,
    tier: "OG",
    breakdown: {
      walletAge: 150,
      transactionCount: 100,
      uniqueContracts: 80,
      nftHoldings: 60,
      daoVotes: 100,
      ensName: 30,
      cleanRecord: 50,
    },
    sybilRisk: "LOW",
    cachedAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: new Date("2021-03-15"),
    updatedAt: new Date(),
  },
  {
    address: BOB,
    score: 490,
    tier: "Established",
    breakdown: {
      walletAge: 70,
      transactionCount: 40,
      uniqueContracts: 30,
      nftHoldings: 20,
      daoVotes: 30,
      ensName: 0,
      cleanRecord: 0,
    },
    sybilRisk: "MEDIUM",
    cachedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days old → time decay eligible
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: new Date("2022-06-10"),
    updatedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000),
  },
  {
    address: EVE,
    score: 120,
    tier: "Anon",
    breakdown: {
      walletAge: 20,
      transactionCount: 40,
      uniqueContracts: 15,
      nftHoldings: 0,
      daoVotes: 0,
      ensName: 0,
      cleanRecord: 0,
    },
    sybilRisk: "HIGH",
    cachedAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date(),
  },
  {
    address: DAVE,
    score: 210,
    tier: "New Wallet",
    breakdown: {
      walletAge: 20,
      transactionCount: 15,
      uniqueContracts: 15,
      nftHoldings: 0,
      daoVotes: 0,
      ensName: 0,
      cleanRecord: 50,
    },
    sybilRisk: "NONE",
    cachedAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date(),
  },
  {
    address: SATOSHI,
    score: 994,
    tier: "OG",
    breakdown: {
      walletAge: 150,
      transactionCount: 100,
      uniqueContracts: 80,
      nftHoldings: 60,
      daoVotes: 100,
      ensName: 30,
      cleanRecord: 80,
    },
    sybilRisk: "NONE",
    cachedAt: new Date(),
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date(),
  },
]);

print("✓ reputationscores seeded");

// ════════════════════════════════════════════════════════════════
//  2. VOTES  (upvote / downvote between users)
// ════════════════════════════════════════════════════════════════
db.votes.deleteMany({});
db.votes.insertMany([
  // Alice gets lots of upvotes
  { voter: BOB,     target: ALICE, type: "upvote",   createdAt: new Date("2024-01-10"), updatedAt: new Date("2024-01-10") },
  { voter: DAVE,    target: ALICE, type: "upvote",   createdAt: new Date("2024-02-14"), updatedAt: new Date("2024-02-14") },
  { voter: SATOSHI, target: ALICE, type: "upvote",   createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-03-01") },
  { voter: EVE,     target: ALICE, type: "upvote",   createdAt: new Date("2024-03-05"), updatedAt: new Date("2024-03-05") },

  // Bob has mixed votes
  { voter: ALICE,   target: BOB,   type: "upvote",   createdAt: new Date("2024-01-15"), updatedAt: new Date("2024-01-15") },
  { voter: EVE,     target: BOB,   type: "downvote", createdAt: new Date("2024-02-20"), updatedAt: new Date("2024-02-20") },

  // Eve SPAM VOTING — 20+ votes in one day (triggers DAO spam penalty -100)
  ...Array.from({ length: 22 }, (_, i) => ({
    voter: EVE,
    target: `0xrandom${i.toString().padStart(40, "0")}`,
    type: "downvote",
    createdAt: new Date("2024-04-10T10:00:00Z"), // all same day
    updatedAt: new Date("2024-04-10T10:00:00Z"),
  })),

  // Satoshi — mostly upvotes received
  { voter: ALICE, target: SATOSHI, type: "upvote", createdAt: new Date("2024-01-01"), updatedAt: new Date("2024-01-01") },
  { voter: BOB,   target: SATOSHI, type: "upvote", createdAt: new Date("2024-02-01"), updatedAt: new Date("2024-02-01") },
  { voter: DAVE,  target: SATOSHI, type: "upvote", createdAt: new Date("2024-03-01"), updatedAt: new Date("2024-03-01") },
]);

print("✓ votes seeded");

// ════════════════════════════════════════════════════════════════
//  3. REVIEWS  (peer reviews after trades)
// ════════════════════════════════════════════════════════════════
db.reviews.deleteMany({});
db.reviews.insertMany([
  // Alice — excellent reviews
  {
    reviewer: BOB,
    reviewee: ALICE,
    rating: 5,
    comment: "Super reliable, fast trade, highly recommended.",
    qualifyingTxHash: "0xabc111",
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10"),
  },
  {
    reviewer: SATOSHI,
    reviewee: ALICE,
    rating: 5,
    comment: "One of the most trustworthy traders I know.",
    qualifyingTxHash: "0xabc222",
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-03-05"),
  },
  {
    reviewer: DAVE,
    reviewee: ALICE,
    rating: 4,
    comment: "Good experience overall.",
    qualifyingTxHash: "0xabc333",
    createdAt: new Date("2024-03-18"),
    updatedAt: new Date("2024-03-18"),
  },

  // Bob — mediocre reviews
  {
    reviewer: ALICE,
    reviewee: BOB,
    rating: 3,
    comment: "Completed trade but was slow to respond.",
    qualifyingTxHash: "0xbob111",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-02-20"),
  },

  // Eve — bad reviews
  {
    reviewer: ALICE,
    reviewee: EVE,
    rating: 1,
    comment: "Dumped NFTs right after purchase, felt scammy.",
    qualifyingTxHash: "0xeve111",
    createdAt: new Date("2024-04-01"),
    updatedAt: new Date("2024-04-01"),
  },
  {
    reviewer: BOB,
    reviewee: EVE,
    rating: 2,
    comment: "Suspicious behaviour, would not trade again.",
    qualifyingTxHash: "0xeve222",
    createdAt: new Date("2024-04-05"),
    updatedAt: new Date("2024-04-05"),
  },

  // Satoshi — perfect
  {
    reviewer: ALICE,
    reviewee: SATOSHI,
    rating: 5,
    comment: "OG wallet, absolute legend.",
    qualifyingTxHash: "0xsat111",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    reviewer: DAVE,
    reviewee: SATOSHI,
    rating: 5,
    comment: "Very trustworthy.",
    qualifyingTxHash: "0xsat222",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]);

print("✓ reviews seeded");

// ════════════════════════════════════════════════════════════════
//  4. TRADES
// ════════════════════════════════════════════════════════════════
db.trades.deleteMany({});
db.trades.insertMany([
  // Alice ↔ Bob — normal token trade
  {
    partyA: ALICE,
    partyB: BOB,
    txHash: "0xtrade_ab1",
    amount: "2.5",
    chain: "ethereum",
    tradeType: "token_transfer",
    timestamp: new Date("2024-02-05"),
    createdAt: new Date("2024-02-05"),
    updatedAt: new Date("2024-02-05"),
  },
  // Alice ↔ Satoshi — NFT trade
  {
    partyA: ALICE,
    partyB: SATOSHI,
    txHash: "0xtrade_as1",
    amount: "10",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-03-01"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  // Eve NFT flips (buy and dump within 1 hour — triggers dump penalty)
  {
    partyA: EVE,
    partyB: ALICE,
    txHash: "0xeve_buy1",
    amount: "0.8",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-01T10:00:00Z"),
    createdAt: new Date("2024-04-01T10:00:00Z"),
    updatedAt: new Date("2024-04-01T10:00:00Z"),
  },
  {
    partyA: EVE,
    partyB: BOB,
    txHash: "0xeve_dump1",
    amount: "0.5",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-01T10:30:00Z"), // 30 min later
    createdAt: new Date("2024-04-01T10:30:00Z"),
    updatedAt: new Date("2024-04-01T10:30:00Z"),
  },
  {
    partyA: EVE,
    partyB: DAVE,
    txHash: "0xeve_buy2",
    amount: "0.9",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-02T09:00:00Z"),
    createdAt: new Date("2024-04-02T09:00:00Z"),
    updatedAt: new Date("2024-04-02T09:00:00Z"),
  },
  {
    partyA: EVE,
    partyB: ALICE,
    txHash: "0xeve_dump2",
    amount: "0.6",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-02T09:45:00Z"), // 45 min later
    createdAt: new Date("2024-04-02T09:45:00Z"),
    updatedAt: new Date("2024-04-02T09:45:00Z"),
  },
  {
    partyA: EVE,
    partyB: SATOSHI,
    txHash: "0xeve_buy3",
    amount: "1.1",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-03T14:00:00Z"),
    createdAt: new Date("2024-04-03T14:00:00Z"),
    updatedAt: new Date("2024-04-03T14:00:00Z"),
  },
  {
    partyA: EVE,
    partyB: BOB,
    txHash: "0xeve_dump3",
    amount: "0.7",
    chain: "ethereum",
    tradeType: "nft_trade",
    timestamp: new Date("2024-04-03T14:50:00Z"), // 50 min later
    createdAt: new Date("2024-04-03T14:50:00Z"),
    updatedAt: new Date("2024-04-03T14:50:00Z"),
  },
]);

print("✓ trades seeded");

// ════════════════════════════════════════════════════════════════
//  5. BADGES
// ════════════════════════════════════════════════════════════════
db.badges.deleteMany({});
db.badges.insertMany([
  // Alice — full set
  { address: ALICE, type: "DAO_VOTER",       earnedAt: new Date("2022-06-01"), createdAt: new Date("2022-06-01") },
  { address: ALICE, type: "OG_WALLET",       earnedAt: new Date("2022-01-01"), createdAt: new Date("2022-01-01") },
  { address: ALICE, type: "ENS_HOLDER",      earnedAt: new Date("2022-03-01"), createdAt: new Date("2022-03-01") },
  { address: ALICE, type: "DIAMOND_HANDS",   earnedAt: new Date("2023-01-01"), createdAt: new Date("2023-01-01") },
  { address: ALICE, type: "VERIFIED_HUMAN",  earnedAt: new Date("2022-07-01"), createdAt: new Date("2022-07-01") },
  { address: ALICE, type: "PLATINUM",        earnedAt: new Date("2023-06-01"), createdAt: new Date("2023-06-01") },

  // Bob — partial
  { address: BOB, type: "DAO_VOTER",    earnedAt: new Date("2023-03-01"), createdAt: new Date("2023-03-01") },
  { address: BOB, type: "POWER_USER",   earnedAt: new Date("2023-08-01"), createdAt: new Date("2023-08-01") },

  // Satoshi — everything
  { address: SATOSHI, type: "DAO_VOTER",      earnedAt: new Date("2020-06-01"), createdAt: new Date("2020-06-01") },
  { address: SATOSHI, type: "OG_WALLET",      earnedAt: new Date("2020-01-01"), createdAt: new Date("2020-01-01") },
  { address: SATOSHI, type: "ENS_HOLDER",     earnedAt: new Date("2020-03-01"), createdAt: new Date("2020-03-01") },
  { address: SATOSHI, type: "DIAMOND_HANDS",  earnedAt: new Date("2021-01-01"), createdAt: new Date("2021-01-01") },
  { address: SATOSHI, type: "POWER_USER",     earnedAt: new Date("2021-06-01"), createdAt: new Date("2021-06-01") },
  { address: SATOSHI, type: "VERIFIED_HUMAN", earnedAt: new Date("2020-07-01"), createdAt: new Date("2020-07-01") },
  { address: SATOSHI, type: "PLATINUM",       earnedAt: new Date("2022-01-01"), createdAt: new Date("2022-01-01") },

  // Dave — none
  // Eve — none (penalised user)
]);

print("✓ badges seeded");

// ════════════════════════════════════════════════════════════════
//  6. NONCES  (auth, TTL 5 min each)
// ════════════════════════════════════════════════════════════════
db.nonces.deleteMany({});
db.nonces.insertMany([
  {
    address: ALICE,
    nonce: "etherealvault-nonce-alice-abc123",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  },
  {
    address: BOB,
    nonce: "etherealvault-nonce-bob-def456",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  },
]);

print("✓ nonces seeded");

// ════════════════════════════════════════════════════════════════
//  7. USERS  (lean profile docs used by controllers)
// ════════════════════════════════════════════════════════════════
db.users.deleteMany({});
db.users.insertMany([
  {
    address: ALICE,
    ensName: "alice.eth",
    tier: "OG",
    sybilRisk: "LOW",
    createdAt: new Date("2021-03-15"),
    updatedAt: new Date(),
  },
  {
    address: BOB,
    ensName: null,
    tier: "Established",
    sybilRisk: "MEDIUM",
    createdAt: new Date("2022-06-10"),
    updatedAt: new Date(),
  },
  {
    address: EVE,
    ensName: null,
    tier: "Anon",
    sybilRisk: "HIGH",
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date(),
  },
  {
    address: DAVE,
    ensName: null,
    tier: "New Wallet",
    sybilRisk: "NONE",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date(),
  },
  {
    address: SATOSHI,
    ensName: "satoshi.eth",
    tier: "OG",
    sybilRisk: "NONE",
    createdAt: new Date("2020-01-01"),
    updatedAt: new Date(),
  },
]);

print("✓ users seeded");
print("\n🎉 All collections seeded successfully!");
print("\nExpected score outcomes when recalculated:");
print("  ALICE   → ~820+ (OG, consistent, great reviews, full badges)");
print("  BOB     → ~390  (Established, time decay hits, medium sybil)");
print("  EVE     → ~50   (Anon, HIGH sybil, dump+spam+bad reviews)");
print("  DAVE    → ~200  (New Wallet, clean but inactive)");
print("  SATOSHI → ~994  (Max OG, all badges, perfect record)");