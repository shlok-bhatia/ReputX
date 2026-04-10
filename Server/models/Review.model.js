import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    reviewee: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    // Optional: track the trade that qualifies this review
    qualifyingTxHash: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// One review per (reviewer, reviewee) pair — enforced at DB level
reviewSchema.index({ reviewer: 1, reviewee: 1 }, { unique: true });

// Index for fetching all reviews on a profile
reviewSchema.index({ reviewee: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
