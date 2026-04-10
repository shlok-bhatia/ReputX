import { ethers } from "ethers";
import alchemyService from "../services/alchemyService.js";
import snapshotService from "../services/snapshotService.js";
import ensService from "../services/ensService.js";
import { calculateScore } from "../services/scoreEngine.js";
import { detectSybil } from "../services/sybilDetector.js";
import ReputationScore from "../models/ReputationScore.model.js";
import User from "../models/User.model.js";
import Badge from "../models/Badge.model.js";

/**
 * Fetch all on-chain data and compute score for a given address
 */
async function computeReputation(address) {
  const [transactions, nftData, ensName, daoData, walletFirstTx] =
    await Promise.all([
      alchemyService.getTransactions(address),
      alchemyService.getNFTs(address),
      ensService.resolveENS(address),
      snapshotService.getDAOVotes(address),
      alchemyService.getWalletAge(address),
    ]);

  const uniqueContracts = await alchemyService.getUniqueContracts(address);

  const walletAgeDays = walletFirstTx
    ? (Date.now() - new Date(walletFirstTx).getTime()) / (1000 * 60 * 60 * 24)
    : null;

  // Run sybil detection
  const sybil = detectSybil({
    walletAgeDays,
    ensName,
    transactions,
    daoVotes: daoData.totalVotes,
    nftData,
  });

  // Calculate reputation score
  const { score, tier, breakdown } = calculateScore({
    firstTxDate: walletFirstTx,
    totalTransactions: transactions.total,
    uniqueContracts,
    nftData,
    daoVotes: daoData.totalVotes,
    ensName,
    hasScamInteraction: false, // TODO: integrate scam contract list
    sybilRisk: sybil.risk,
  });

  return {
    score,
    tier,
    breakdown,
    sybilRisk: sybil.risk,
    sybilFlags: sybil.flags,
    ensName,
    rawData: { transactions, nftData, daoData, walletAgeDays, uniqueContracts },
  };
}

/**
 * GET /reputation/:address
 * Returns cached score or calculates fresh
 */
export async function getReputation(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Check cache
    const cached = await ReputationScore.findOne({ address });
    if (cached) {
      const badges = await Badge.find({ address }).lean();
      return res.json({
        address,
        score: cached.score,
        tier: cached.tier,
        breakdown: cached.breakdown,
        sybilRisk: cached.sybilRisk,
        badges: badges.map(b => b.type),
        cachedAt: cached.cachedAt,
        fromCache: true,
      });
    }

    const result = await computeReputation(address);

    // Upsert score in DB
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
      badges: badges.map(b => b.type),
      cachedAt: new Date(),
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

    // Delete cached score to force fresh compute
    await ReputationScore.deleteOne({ address });

    const result = await computeReputation(address);

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
      badges: badges.map(b => b.type),
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

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const cached = await ReputationScore.findOne({ address });

    if (cached) {
      return res.json({
        address,
        score: cached.score,
        tier: cached.tier,
        sybilRisk: cached.sybilRisk,
        cachedAt: cached.cachedAt,
      });
    }

    // Compute on-demand for public API (lighter response)
    const result = await computeReputation(address);

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
      cachedAt: new Date(),
    });
  } catch (err) {
    next(err);
  }
}

export default { getReputation, recalculateReputation, publicScoreAPI };