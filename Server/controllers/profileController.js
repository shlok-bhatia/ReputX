import { ethers } from "ethers";
import User from "../models/User.model.js";
import ReputationScore from "../models/ReputationScore.model.js";
import Badge from "../models/Badge.model.js";

/**
 * GET /profile/:address
 * Full public profile: score, badges, ENS, tier
 */
export async function getProfile(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (!user.isPublic) {
      return res.status(403).json({ error: "This profile is private" });
    }

    const [scoreDoc, badges] = await Promise.all([
      ReputationScore.findOne({ address }),
      Badge.find({ address }),
    ]);

    return res.json({
      address,
      ensName: user.ensName,
      tier: user.tier,
      isPublic: user.isPublic,
      sybilRisk: user.sybilRisk,
      score: scoreDoc?.score ?? null,
      breakdown: scoreDoc?.breakdown ?? null,
      badges: badges.map((b) => ({
        type: b.type,
        awardedAt: b.awardedAt,
        metadata: b.metadata,
      })),
      memberSince: user.createdAt,
      lastSeen: user.lastSeen,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /profile/visibility
 * Toggle public/private (JWT required)
 */
export async function updateVisibility(req, res, next) {
  try {
    const address = req.user.address;
    const { isPublic } = req.body;

    if (typeof isPublic !== "boolean") {
      return res.status(400).json({ error: "isPublic must be a boolean" });
    }

    const user = await User.findOneAndUpdate(
      { address },
      { isPublic },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json({ address, isPublic: user.isPublic });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /leaderboard
 * Top 100 wallets by score (public only)
 */
export async function getLeaderboard(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 100);
    const skip = (page - 1) * limit;

    // Get public users only
    const publicUsers = await User.find({ isPublic: true }).distinct("address");

    const scores = await ReputationScore.find({
      address: { $in: publicUsers },
      sybilRisk: { $ne: "HIGH" },
    })
      .sort({ score: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Enrich with ENS names from User model
    const userMap = await User.find({
      address: { $in: scores.map((s) => s.address) },
    }).lean();

    const userMapByAddress = Object.fromEntries(
      userMap.map((u) => [u.address, u])
    );

    const leaderboard = scores.map((s, idx) => ({
      rank: skip + idx + 1,
      address: s.address,
      ensName: userMapByAddress[s.address]?.ensName || null,
      score: s.score,
      tier: s.tier,
    }));

    return res.json({ leaderboard, page, limit });
  } catch (err) {
    next(err);
  }
}

export default { getProfile, updateVisibility, getLeaderboard };