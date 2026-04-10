import mongoose from "mongoose";

const tradeSchema = new mongoose.Schema(
  {
    partyA: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    partyB: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    txHash: {
      type: String,
      default: null,
    },
    amount: {
      type: String,
      default: "0",
    },
    chain: {
      type: String,
      enum: ["ethereum", "polygon", "arbitrum", "optimism", "base"],
      default: "ethereum",
    },
    tradeType: {
      type: String,
      enum: ["token_transfer", "nft_trade", "swap", "contract_interaction"],
      default: "token_transfer",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for fast mutual-trade lookups (bidirectional)
tradeSchema.index({ partyA: 1, partyB: 1 });
tradeSchema.index({ partyB: 1, partyA: 1 });

/**
 * Check if two addresses have traded with each other (bidirectional).
 * Returns true if at least one trade exists in either direction.
 */
tradeSchema.statics.areMutualTraders = async function (addressA, addressB) {
  const a = addressA.toLowerCase();
  const b = addressB.toLowerCase();

  const trade = await this.findOne({
    $or: [
      { partyA: a, partyB: b },
      { partyA: b, partyB: a },
    ],
  });

  return !!trade;
};

export default mongoose.model("Trade", tradeSchema);
