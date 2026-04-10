import mongoose from "mongoose";

const nonceSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  nonce: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 min TTL
    index: { expireAfterSeconds: 0 },
  },
});

export default mongoose.model("Nonce", nonceSchema);