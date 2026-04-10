import mongoose from "mongoose";

const reputationScoreSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1000,
      default: 0,
    },
    tier: {
      type: String,
      enum: ["Anon", "New Wallet", "Established", "Trusted", "OG"],
      default: "Anon",
    },
    breakdown: {
      walletAge: { type: Number, default: 0 },
      transactionCount: { type: Number, default: 0 },
      uniqueContracts: { type: Number, default: 0 },
      nftHoldings: { type: Number, default: 0 },
      daoVotes: { type: Number, default: 0 },
      ensName: { type: Number, default: 0 },
      cleanRecord: { type: Number, default: 0 },
    },
    sybilRisk: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "NONE"],
      default: "NONE",
    },
    cachedAt: {
      type: Date,
      default: Date.now,
    },
    // Auto-expire cache after 6 hours
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReputationScore", reputationScoreSchema);