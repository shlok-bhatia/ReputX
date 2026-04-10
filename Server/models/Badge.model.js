import mongoose from "mongoose";

const BADGE_TYPES = [
  "DAO_VOTER",
  "DIAMOND_HANDS",
  "POWER_USER",
  "ENS_HOLDER",
  "OG_WALLET",
  "CLEAN_RECORD",
  "MULTI_CHAIN",
  "DAO_FOUNDER",
  "VERIFIED_HUMAN",
  "PLATINUM",
];

const badgeSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: BADGE_TYPES,
      required: true,
    },
    awardedAt: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

badgeSchema.index({ address: 1, type: 1 }, { unique: true });

export { BADGE_TYPES };
export default mongoose.model("Badge", badgeSchema);