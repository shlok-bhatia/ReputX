import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    ensName: {
      type: String,
      default: null,
    },
    displayName: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      maxLength: 160,
    },
    email: {
      type: String,
      default: null,
    },
    twitter: {
      type: String,
      default: null,
    },
    tier: {
      type: String,
      enum: ["Anon", "New Wallet", "Established", "Trusted", "OG"],
      default: "Anon",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    sybilRisk: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "NONE"],
      default: "NONE",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);