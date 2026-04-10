import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    desc: {
      type: String,
      required: true,
    },
    dot: {
      type: String,
      enum: ["cyan", "purple", "gray", "green", "blue", "red", "yellow"],
      default: "gray",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Milestone", milestoneSchema);
