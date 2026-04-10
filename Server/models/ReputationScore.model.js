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
      type: mongoose.Schema.Types.Mixed,
      default: {},
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