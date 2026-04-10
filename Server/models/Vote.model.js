import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    voter: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    target: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["upvote", "downvote"],
      required: true,
    },
  },
  { timestamps: true }
);

// One vote per (voter, target) pair — can switch type via upsert
voteSchema.index({ voter: 1, target: 1 }, { unique: true });

// Index for counting votes on a target
voteSchema.index({ target: 1, type: 1 });

export default mongoose.model("Vote", voteSchema);
