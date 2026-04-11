import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ReputationScore from './models/ReputationScore.model.js';
import Vote from './models/Vote.model.js';
import Review from './models/Review.model.js';
import Trade from './models/Trade.model.js';
import Badge from './models/Badge.model.js';
import Nonce from './models/Nonce.model.js';
import User from './models/User.model.js';

dotenv.config();

// ── ADDRESSES used across all collections ────────────────────────
const ALICE   = "0xaa1ce00000000000000000000000000000000001";
const BOB     = "0xbb0b000000000000000000000000000000000002";
const EVE     = "0xee4e000000000000000000000000000000000003";
const DAVE    = "0xdda4e00000000000000000000000000000000004";
const SATOSHI = "0x5a7057000000000000000000000000000000005";

async function seedAppend() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // ════════════════════════════════════════════════════════════════
    //  1. REPUTATION SCORES (UPSERT - Keep existing, update/add new)
    // ════════════════════════════════════════════════════════════════
    const reputationScores = [
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date("2021-03-15"),
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date("2022-06-10"),
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date("2023-09-01"),
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date("2026-01-20"),
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
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
        createdAt: new Date("2020-01-01"),
      },
    ];

    for (const score of reputationScores) {
      await ReputationScore.updateOne(
        { address: score.address },
        { $set: { ...score, updatedAt: new Date(), cachedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log('✓ reputationscores upserted');

    // ════════════════════════════════════════════════════════════════
    //  2. VOTES (UPSERT)
    // ════════════════════════════════════════════════════════════════
    const votes = [
      { voter: BOB,     target: ALICE, type: "upvote",   createdAt: new Date("2026-01-10"), updatedAt: new Date("2026-01-10") },
      { voter: DAVE,    target: ALICE, type: "upvote",   createdAt: new Date("2026-02-14"), updatedAt: new Date("2026-02-14") },
      { voter: SATOSHI, target: ALICE, type: "upvote",   createdAt: new Date("2026-03-01"), updatedAt: new Date("2026-03-01") },
      { voter: EVE,     target: ALICE, type: "upvote",   createdAt: new Date("2026-03-05"), updatedAt: new Date("2026-03-05") },
      { voter: ALICE,   target: BOB,   type: "upvote",   createdAt: new Date("2026-01-15"), updatedAt: new Date("2026-01-15") },
      { voter: EVE,     target: BOB,   type: "downvote", createdAt: new Date("2026-02-20"), updatedAt: new Date("2026-02-20") },
      { voter: ALICE, target: SATOSHI, type: "upvote", createdAt: new Date("2026-01-01"), updatedAt: new Date("2026-01-01") },
      { voter: BOB,   target: SATOSHI, type: "upvote", createdAt: new Date("2026-02-01"), updatedAt: new Date("2026-02-01") },
      { voter: DAVE,  target: SATOSHI, type: "upvote", createdAt: new Date("2026-03-01"), updatedAt: new Date("2026-03-01") },
    ];

    for (const vote of votes) {
      await Vote.updateOne(
        { voter: vote.voter, target: vote.target },
        { $set: vote },
        { upsert: true }
      );
    }
    console.log('✓ votes upserted');

    // ════════════════════════════════════════════════════════════════
    //  3. REVIEWS (UPSERT)
    // ════════════════════════════════════════════════════════════════
    const reviews = [
      {
        reviewer: BOB,
        reviewee: ALICE,
        rating: 5,
        comment: "Super reliable, fast trade, highly recommended.",
        qualifyingTxHash: "0xabc111",
        createdAt: new Date("2026-02-10"),
      },
      {
        reviewer: SATOSHI,
        reviewee: ALICE,
        rating: 5,
        comment: "One of the most trustworthy traders I know.",
        qualifyingTxHash: "0xabc222",
        createdAt: new Date("2026-03-05"),
      },
      {
        reviewer: DAVE,
        reviewee: ALICE,
        rating: 4,
        comment: "Good experience overall.",
        qualifyingTxHash: "0xabc333",
        createdAt: new Date("2026-03-18"),
      },
      {
        reviewer: ALICE,
        reviewee: BOB,
        rating: 3,
        comment: "Completed trade but was slow to respond.",
        qualifyingTxHash: "0xbob111",
        createdAt: new Date("2026-02-20"),
      },
      {
        reviewer: ALICE,
        reviewee: EVE,
        rating: 1,
        comment: "Dumped NFTs right after purchase, felt scammy.",
        qualifyingTxHash: "0xeve111",
        createdAt: new Date("2026-04-01"),
      },
      {
        reviewer: BOB,
        reviewee: EVE,
        rating: 2,
        comment: "Suspicious behaviour, would not trade again.",
        qualifyingTxHash: "0xeve222",
        createdAt: new Date("2026-04-05"),
      },
      {
        reviewer: ALICE,
        reviewee: SATOSHI,
        rating: 5,
        comment: "OG wallet, absolute legend.",
        qualifyingTxHash: "0xsat111",
        createdAt: new Date("2026-01-15"),
      },
      {
        reviewer: DAVE,
        reviewee: SATOSHI,
        rating: 5,
        comment: "Very trustworthy.",
        qualifyingTxHash: "0xsat222",
        createdAt: new Date("2026-02-01"),
      },
    ];

    for (const review of reviews) {
      await Review.updateOne(
        { reviewer: review.reviewer, reviewee: review.reviewee, qualifyingTxHash: review.qualifyingTxHash },
        { $set: { ...review, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log('✓ reviews upserted');

    // ════════════════════════════════════════════════════════════════
    //  4. TRADES (UPSERT)
    // ════════════════════════════════════════════════════════════════
    const trades = [
      {
        partyA: ALICE,
        partyB: BOB,
        txHash: "0xtrade_ab1",
        amount: "2.5",
        chain: "ethereum",
        tradeType: "token_transfer",
        timestamp: new Date("2026-02-05"),
        createdAt: new Date("2026-02-05"),
      },
      {
        partyA: ALICE,
        partyB: SATOSHI,
        txHash: "0xtrade_as1",
        amount: "10",
        chain: "ethereum",
        tradeType: "nft_trade",
        timestamp: new Date("2026-03-01"),
        createdAt: new Date("2026-03-01"),
      },
      {
        partyA: EVE,
        partyB: ALICE,
        txHash: "0xeve_buy1",
        amount: "0.8",
        chain: "ethereum",
        tradeType: "nft_trade",
        timestamp: new Date("2026-04-01T10:00:00Z"),
        createdAt: new Date("2026-04-01T10:00:00Z"),
      },
      {
        partyA: EVE,
        partyB: BOB,
        txHash: "0xeve_dump1",
        amount: "0.5",
        chain: "ethereum",
        tradeType: "nft_trade",
        timestamp: new Date("2026-04-01T10:30:00Z"),
        createdAt: new Date("2026-04-01T10:30:00Z"),
      },
    ];

    for (const trade of trades) {
      await Trade.updateOne(
        { txHash: trade.txHash },
        { $set: { ...trade, updatedAt: new Date() } },
        { upsert: true }
      );
    }
    console.log('✓ trades upserted');

    // ════════════════════════════════════════════════════════════════
    //  5. BADGES (UPSERT)
    // ════════════════════════════════════════════════════════════════
    const badges = [
      { address: ALICE, type: "DAO_VOTER",       earnedAt: new Date("2022-06-01"), createdAt: new Date("2022-06-01") },
      { address: ALICE, type: "OG_WALLET",       earnedAt: new Date("2022-01-01"), createdAt: new Date("2022-01-01") },
      { address: ALICE, type: "PLATINUM",        earnedAt: new Date("2023-06-01"), createdAt: new Date("2023-06-01") },
      { address: BOB, type: "DAO_VOTER",    earnedAt: new Date("2023-03-01"), createdAt: new Date("2023-03-01") },
      { address: SATOSHI, type: "DAO_VOTER",      earnedAt: new Date("2020-06-01"), createdAt: new Date("2020-06-01") },
      { address: SATOSHI, type: "OG_WALLET",      earnedAt: new Date("2020-01-01"), createdAt: new Date("2020-01-01") },
      { address: SATOSHI, type: "PLATINUM",       earnedAt: new Date("2022-01-01"), createdAt: new Date("2022-01-01") },
    ];

    for (const badge of badges) {
      await Badge.updateOne(
        { address: badge.address, type: badge.type },
        { $set: badge },
        { upsert: true }
      );
    }
    console.log('✓ badges upserted');

    // ════════════════════════════════════════════════════════════════
    //  6. NONCES (UPSERT - Auth tokens)
    // ════════════════════════════════════════════════════════════════
    const nonces = [
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
    ];

    for (const nonce of nonces) {
      await Nonce.updateOne(
        { address: nonce.address },
        { $set: nonce },
        { upsert: true }
      );
    }
    console.log('✓ nonces upserted');

    // ════════════════════════════════════════════════════════════════
    //  7. USERS (UPSERT - Keep existing, update/add new)
    // ════════════════════════════════════════════════════════════════
    const users = [
      {
        address: ALICE,
        ensName: "alice.eth",
        tier: "OG",
        sybilRisk: "LOW",
        createdAt: new Date("2021-03-15"),
      },
      {
        address: BOB,
        ensName: null,
        tier: "Established",
        sybilRisk: "MEDIUM",
        createdAt: new Date("2022-06-10"),
      },
      {
        address: EVE,
        ensName: null,
        tier: "Anon",
        sybilRisk: "HIGH",
        createdAt: new Date("2023-09-01"),
      },
      {
        address: DAVE,
        ensName: null,
        tier: "New Wallet",
        sybilRisk: "NONE",
        createdAt: new Date("2026-01-20"),
      },
      {
        address: SATOSHI,
        ensName: "satoshi.eth",
        tier: "OG",
        sybilRisk: "NONE",
        createdAt: new Date("2020-01-01"),
      },
    ];

    for (const user of users) {
      await User.updateOne(
        { address: user.address },
        { 
          $set: user,
          $setOnInsert: { createdAt: user.createdAt }
        },
        { upsert: true }
      );
    }
    console.log('✓ users upserted');

    console.log("\n🎉 All collections appended/updated successfully!");
    console.log("✓ Old documents preserved, new/modified documents added");
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedAppend();
