import { calculateScoreFromDB } from "../services/scoreEngine.js";
import ReputationScore from "../models/ReputationScore.model.js";
import User from "../models/User.model.js";
import Badge from "../models/Badge.model.js";

/**
 * GET /reputation/:address
 * Calculates score live via the score engine using DB data,
 * then caches the result for leaderboard queries.
 */
export async function getReputation(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !address.startsWith("0x")) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Always compute from DB using the score engine
    const result = await calculateScoreFromDB(address);

    // Cache the computed result back to the DB
    await ReputationScore.findOneAndUpdate(
      { address },
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

    // Update user tier and ENS
    await User.findOneAndUpdate(
      { address },
      { tier: result.tier, ensName: result.ensName, sybilRisk: result.sybilRisk },
      { upsert: true }
    );

    const badges = await Badge.find({ address }).lean();

    return res.json({
      address,
      score: result.score,
      tier: result.tier,
      breakdown: result.breakdown,
      sybilRisk: result.sybilRisk,
      badges: badges.map((b) => b.type),
      calculatedAt: new Date(),
      fromCache: false,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /reputation/recalculate
 * Force fresh calculation (JWT required, rate-limited)
 */
export async function recalculateReputation(req, res, next) {
  try {
    const address = req.user.address;

    // Compute from DB using the score engine
    const result = await calculateScoreFromDB(address);

    // Update cached score
    await ReputationScore.findOneAndUpdate(
      { address },
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

    await User.findOneAndUpdate(
      { address },
      { tier: result.tier, ensName: result.ensName, sybilRisk: result.sybilRisk }
    );

    // Emit real-time update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.to(address).emit("score:updated", {
        address,
        score: result.score,
        tier: result.tier,
      });
    }

    const badges = await Badge.find({ address }).lean();

    return res.json({
      address,
      score: result.score,
      tier: result.tier,
      breakdown: result.breakdown,
      sybilRisk: result.sybilRisk,
      badges: badges.map((b) => b.type),
      recalculatedAt: new Date(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/score/:address
 * Public API for third-party dApps
 */
export async function publicScoreAPI(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !address.startsWith("0x")) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Always compute from DB
    const result = await calculateScoreFromDB(address);

    // Cache result
    await ReputationScore.findOneAndUpdate(
      { address },
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

    return res.json({
      address,
      score: result.score,
      tier: result.tier,
      sybilRisk: result.sybilRisk,
      calculatedAt: new Date(),
    });
  } catch (err) {
    next(err);
  }
}

export default { getReputation, recalculateReputation, publicScoreAPI };