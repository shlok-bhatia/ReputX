import dotenv from "dotenv";
import mongoose from "mongoose";
import crypto from "crypto";
import User from "./models/User.model.js";
import Badge, { BADGE_TYPES } from "./models/Badge.model.js";
import Nonce from "./models/Nonce.model.js";
import ReputationScore from "./models/ReputationScore.model.js";
import Review from "./models/Review.model.js";
import Trade from "./models/Trade.model.js";
import Vote from "./models/Vote.model.js";

dotenv.config();

const generateEthAddress = () => "0x" + crypto.randomBytes(20).toString("hex").toLowerCase();

const seed = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Badge.deleteMany({}),
      Nonce.deleteMany({}),
      ReputationScore.deleteMany({}),
      Review.deleteMany({}),
      Trade.deleteMany({}),
      Vote.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

    // Generate 15 users
    const addresses = Array.from({ length: 15 }, () => generateEthAddress());
    
    // User
    const users = addresses.map((address, i) => ({
      address,
      ensName: i % 2 === 0 ? `user${i}.eth` : null,
      tier: ["Anon", "New Wallet", "Established", "Trusted", "OG"][i % 5],
      isPublic: true,
      sybilRisk: ["LOW", "MEDIUM", "HIGH", "NONE"][i % 4],
    }));
    await User.insertMany(users);

    // Badge
    const badges = addresses.map((address, i) => ({
      address,
      type: BADGE_TYPES[i % BADGE_TYPES.length],
      metadata: { point: i },
    }));
    await Badge.insertMany(badges);

    // Nonce
    const nonces = addresses.map((address, i) => ({
      address,
      nonce: `nonce_value_${i}`,
    }));
    await Nonce.insertMany(nonces);

    // ReputationScore
    const scores = addresses.map((address, i) => ({
      address,
      score: Math.floor(Math.random() * 1000),
      tier: ["Anon", "New Wallet", "Established", "Trusted", "OG"][i % 5],
      breakdown: {
        walletAge: i * 2,
        transactionCount: i * 5,
        uniqueContracts: i,
        nftHoldings: i % 3,
        daoVotes: i % 4,
        ensName: i % 2 === 0 ? 10 : 0,
        cleanRecord: 20,
      },
      sybilRisk: ["LOW", "MEDIUM", "HIGH", "NONE"][i % 4],
    }));
    await ReputationScore.insertMany(scores);

    // Trades (pairs of users, cyclic)
    const trades = [];
    for (let i = 0; i < 15; i++) {
      trades.push({
        partyA: addresses[i],
        partyB: addresses[(i + 1) % 15],
        txHash: "0x" + crypto.randomBytes(32).toString("hex"),
        amount: String((i + 1) * 100),
        chain: ["ethereum", "polygon", "arbitrum", "optimism", "base"][i % 5],
        tradeType: ["token_transfer", "nft_trade", "swap", "contract_interaction"][i % 4],
      });
    }
    await Trade.insertMany(trades);

    // Reviews
    const reviews = [];
    for (let i = 0; i < 15; i++) {
        reviews.push({
            reviewer: addresses[i],
            reviewee: addresses[(i + 1) % 15], // same as trade pair
            rating: (i % 5) + 1,
            comment: `This is a review from ${addresses[i].substring(0, 8)} to ${addresses[(i + 1) % 15].substring(0, 8)}. Good trade!`,
            qualifyingTxHash: trades[i].txHash,
        })
    }
    await Review.insertMany(reviews);

    // Votes
    const votes = [];
    for (let i = 0; i < 15; i++) {
      // voter votes on target
      votes.push({
        voter: addresses[i],
        target: addresses[(i + 2) % 15],
        type: i % 2 === 0 ? "upvote" : "downvote",
      });
    }
    await Vote.insertMany(votes);

    console.log("Seeded 15 documents for all models.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

seed();
