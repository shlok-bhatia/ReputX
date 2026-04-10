import { ethers } from "ethers";
import Trade from "../models/Trade.model.js";
import Review from "../models/Review.model.js";
import Vote from "../models/Vote.model.js";
import User from "../models/User.model.js";
import alchemyService from "../services/alchemyService.js";

/**
 * Hybrid Verification: Check DB first, fallback to Alchemy if no trade found.
 * Cache in DB if Alchemy finds a trade.
 */
async function verifyAndCacheMutualTrade(myAddress, targetAddress) {
  // 1. Check DB first (instant)
  const isMutual = await Trade.areMutualTraders(myAddress, targetAddress);
  if (isMutual) return true;

  // 2. If not found in DB, check Alchemy (on-chain API call)
  const onChainTrade = await alchemyService.checkMutualTransfers(myAddress, targetAddress);
  
  if (onChainTrade) {
    // 3. Cache the found trade into our DB for instant future Lookups
    await Trade.create({
      partyA: myAddress,
      partyB: targetAddress,
      txHash: onChainTrade.txHash,
      timestamp: onChainTrade.timestamp || new Date(),
    });
    return true;
  }

  return false;
}

/**
 * GET /api/reviews/:address/check-trade
 * Check if the authenticated user is a mutual trader with :address
 */
export async function checkMutualTrade(req, res, next) {
  try {
    const targetAddress = req.params.address?.toLowerCase();
    const myAddress = req.user?.address?.toLowerCase();

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      return res.status(400).json({ error: "Invalid target address" });
    }

    if (!myAddress) {
      return res.json({ isMutualTrader: false });
    }

    // Cannot review yourself
    if (myAddress === targetAddress) {
      return res.json({ isMutualTrader: false, isSelf: true });
    }

    const isMutualTrader = await verifyAndCacheMutualTrade(myAddress, targetAddress);

    return res.json({ isMutualTrader, myAddress, targetAddress });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/:address
 * Fetch all reviews for a given profile address
 */
export async function getReviews(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const reviews = await Review.find({ reviewee: address })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Enrich with reviewer ENS names
    const reviewerAddresses = reviews.map((r) => r.reviewer);
    const users = await User.find({
      address: { $in: reviewerAddresses },
    }).lean();

    const userMap = Object.fromEntries(users.map((u) => [u.address, u]));

    const enriched = reviews.map((r) => ({
      id: r._id,
      reviewer: r.reviewer,
      reviewerEns: userMap[r.reviewer]?.ensName || null,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

    return res.json({ reviews: enriched, total: enriched.length });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reviews/:address
 * Submit or update a review (requires auth + mutual trade)
 */
export async function submitReview(req, res, next) {
  try {
    const targetAddress = req.params.address?.toLowerCase();
    const myAddress = req.user.address?.toLowerCase();

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      return res.status(400).json({ error: "Invalid target address" });
    }

    if (myAddress === targetAddress) {
      return res.status(400).json({ error: "Cannot review yourself" });
    }

    // Verify mutual trade
    const isMutual = await verifyAndCacheMutualTrade(myAddress, targetAddress);
    if (!isMutual) {
      return res.status(403).json({
        error: "Mutual trade required",
        message: "You must have traded with this wallet to leave a review.",
      });
    }

    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment is required" });
    }

    if (comment.length > 500) {
      return res
        .status(400)
        .json({ error: "Comment must be 500 characters or less" });
    }

    // Upsert — one review per reviewer/reviewee pair
    const review = await Review.findOneAndUpdate(
      { reviewer: myAddress, reviewee: targetAddress },
      {
        reviewer: myAddress,
        reviewee: targetAddress,
        rating: Math.round(rating),
        comment: comment.trim(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      id: review._id,
      reviewer: review.reviewer,
      reviewee: review.reviewee,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
    });
  } catch (err) {
    // Handle duplicate key error gracefully
    if (err.code === 11000) {
      return res.status(409).json({
        error: "You have already reviewed this profile. Your review was updated.",
      });
    }
    next(err);
  }
}

/**
 * DELETE /api/reviews/:address
 * Delete own review on a profile
 */
export async function deleteReview(req, res, next) {
  try {
    const targetAddress = req.params.address?.toLowerCase();
    const myAddress = req.user.address?.toLowerCase();

    const deleted = await Review.findOneAndDelete({
      reviewer: myAddress,
      reviewee: targetAddress,
    });

    if (!deleted) {
      return res.status(404).json({ error: "Review not found" });
    }

    return res.json({ message: "Review deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/reviews/:address/vote
 * Upvote or downvote a profile (requires auth + mutual trade)
 * Body: { type: "upvote" | "downvote" }
 * Sending the same vote type again removes the vote (toggle).
 */
export async function castVote(req, res, next) {
  try {
    const targetAddress = req.params.address?.toLowerCase();
    const myAddress = req.user.address?.toLowerCase();

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      return res.status(400).json({ error: "Invalid target address" });
    }

    if (myAddress === targetAddress) {
      return res.status(400).json({ error: "Cannot vote on yourself" });
    }

    // Verify mutual trade
    const isMutual = await verifyAndCacheMutualTrade(myAddress, targetAddress);
    if (!isMutual) {
      return res.status(403).json({
        error: "Mutual trade required",
        message: "You must have traded with this wallet to vote.",
      });
    }

    const { type } = req.body;
    if (!["upvote", "downvote"].includes(type)) {
      return res
        .status(400)
        .json({ error: 'Vote type must be "upvote" or "downvote"' });
    }

    // Check current vote
    const existingVote = await Vote.findOne({
      voter: myAddress,
      target: targetAddress,
    });

    if (existingVote && existingVote.type === type) {
      // Same vote again — toggle off (remove)
      await Vote.deleteOne({ _id: existingVote._id });
      const summary = await getVoteCounts(targetAddress);
      return res.json({
        action: "removed",
        currentVote: null,
        ...summary,
      });
    }

    // Upsert the vote (switch or create)
    await Vote.findOneAndUpdate(
      { voter: myAddress, target: targetAddress },
      { voter: myAddress, target: targetAddress, type },
      { upsert: true, new: true }
    );

    const summary = await getVoteCounts(targetAddress);
    return res.json({
      action: existingVote ? "switched" : "created",
      currentVote: type,
      ...summary,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/reviews/:address/vote-summary
 * Get upvote/downvote counts + current user's vote (if auth'd)
 */
export async function getVoteSummary(req, res, next) {
  try {
    const targetAddress = req.params.address?.toLowerCase();

    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      return res.status(400).json({ error: "Invalid address" });
    }

    const summary = await getVoteCounts(targetAddress);

    // If there's an auth'd user, get their current vote
    let currentVote = null;
    if (req.user?.address) {
      const myVote = await Vote.findOne({
        voter: req.user.address.toLowerCase(),
        target: targetAddress,
      });
      currentVote = myVote?.type || null;
    }

    return res.json({ ...summary, currentVote });
  } catch (err) {
    next(err);
  }
}

/**
 * Helper: get aggregate vote counts for a target
 */
async function getVoteCounts(target) {
  const [upvotes, downvotes] = await Promise.all([
    Vote.countDocuments({ target, type: "upvote" }),
    Vote.countDocuments({ target, type: "downvote" }),
  ]);
  return { upvotes, downvotes };
}

export default {
  checkMutualTrade,
  getReviews,
  submitReview,
  deleteReview,
  castVote,
  getVoteSummary,
};
