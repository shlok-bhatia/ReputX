
import User from "../models/User.model.js";
import Badge from "../models/Badge.model.js";
import ReputationScore from "../models/ReputationScore.model.js";
import { calculateScoreFromDB } from "../services/scoreEngine.js";

/**
 * GET /profile/:address
 * Full public profile: live-calculated score, badges, ENS, tier
 */
export async function getProfile(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !address.startsWith("0x")) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const user = await User.findOne({ address });

    if (!user) {
      return res.status(404).json({ error: "Profile not found" });
    }

    if (!user.isPublic) {
      return res.status(403).json({ error: "This profile is private" });
    }

    // Calculate score live via the score engine
    const scoreResult = await calculateScoreFromDB(address);

    // Cache the computed result for leaderboard use
    await ReputationScore.findOneAndUpdate(
      { address },
      {
        score: scoreResult.score,
        tier: scoreResult.tier,
        breakdown: scoreResult.breakdown,
        sybilRisk: scoreResult.sybilRisk,
        cachedAt: new Date(),
        expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    const badges = await Badge.find({ address });

    return res.json({
      address,
      ensName: scoreResult.ensName || user.ensName,
      tier: scoreResult.tier,
      isPublic: user.isPublic,
      sybilRisk: scoreResult.sybilRisk,
      score: scoreResult.score,
      breakdown: scoreResult.breakdown,
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
 * Top wallets by live-calculated score (public only)
 */
export async function getLeaderboard(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 100);
    const skip = (page - 1) * limit;

    // Get all public, non-HIGH-sybil users
    const publicUsers = await User.find({
      isPublic: true,
      sybilRisk: { $ne: "HIGH" },
    }).lean();

    if (publicUsers.length === 0) {
      return res.json({ leaderboard: [], page, limit, total: 0, avgScore: 0 });
    }

    // Calculate scores live for all public users via the score engine
    const scored = await Promise.all(
      publicUsers.map(async (u) => {
        try {
          const result = await calculateScoreFromDB(u.address);

          // Cache the computed result back to the DB
          await ReputationScore.findOneAndUpdate(
            { address: u.address },
            {
              score: result.score,
              tier: result.tier,
              breakdown: result.breakdown,
              sybilRisk: result.sybilRisk,
              cachedAt: new Date(),
              expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000),
            },
            { upsert: true, new: true }
          );

          return {
            address: u.address,
            ensName: result.ensName || u.ensName || null,
            score: result.score,
            tier: result.tier,
          };
        } catch (err) {
          console.error(`[Leaderboard] Score calc failed for ${u.address}:`, err.message);
          return null;
        }
      })
    );

    // Filter out failed calculations and sort by score descending
    const validScores = scored.filter(Boolean).sort((a, b) => b.score - a.score);

    // Calculate average
    const avgScore =
      validScores.length > 0
        ? Math.round(
            validScores.reduce((sum, s) => sum + s.score, 0) / validScores.length
          )
        : 0;

    // Paginate
    const paged = validScores.slice(skip, skip + limit);

    const leaderboard = paged.map((s, idx) => ({
      rank: skip + idx + 1,
      address: s.address,
      ensName: s.ensName,
      score: s.score,
      tier: s.tier,
    }));

    return res.json({
      leaderboard,
      page,
      limit,
      total: validScores.length,
      avgScore,
    });
  } catch (err) {
    next(err);
  }
}

export default { getProfile, updateVisibility, getLeaderboard };