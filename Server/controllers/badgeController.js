import { ethers } from "ethers";
import Badge from "../models/Badge.model.js";
import ReputationScore from "../models/ReputationScore.model.js";
import alchemyService from "../services/alchemyService.js";
import snapshotService from "../services/snapshotService.js";

const BADGE_DEFINITIONS = {
  DAO_VOTER: {
    label: "DAO Voter",
    description: "Cast 10 or more governance votes on Snapshot",
    check: async ({ daoVotes }) => daoVotes >= 10,
  },
  POWER_USER: {
    label: "Power User",
    description: "500 or more total transactions",
    check: async ({ totalTransactions }) => totalTransactions >= 500,
  },
  ENS_HOLDER: {
    label: "ENS Holder",
    description: "Owns at least one .eth ENS name",
    check: async ({ ensName }) => Boolean(ensName),
  },
  OG_WALLET: {
    label: "OG Wallet",
    description: "Wallet created before January 1, 2020",
    check: async ({ walletFirstTx }) => {
      if (!walletFirstTx) return false;
      return new Date(walletFirstTx) < new Date("2020-01-01");
    },
  },
  CLEAN_RECORD: {
    label: "Clean Record",
    description: "Zero interactions with known scam or drainer contracts",
    check: async ({ hasScamInteraction }) => !hasScamInteraction,
  },
  DIAMOND_HANDS: {
    label: "Diamond Hands",
    description: "Held an NFT for 365+ days without selling",
    check: async ({ nftData }) => {
      if (!nftData?.nfts?.length) return false;
      const oneYearAgo = Date.now() - 365 * 24 * 60 * 60 * 1000;
      return nftData.nfts.some((nft) => {
        const acquired = nft.acquiredAt?.blockTimestamp;
        return acquired && new Date(acquired).getTime() < oneYearAgo;
      });
    },
  },
  DAO_FOUNDER: {
    label: "DAO Founder",
    description: "Created a Snapshot space with 50+ members",
    check: async ({ address }) => {
      const spaces = await snapshotService.getCreatedSpaces(address);
      return spaces.length > 0;
    },
  },
};

/**
 * GET /badges/:address
 * List all earned badges for a wallet
 */
export async function getBadges(req, res, next) {
  try {
    const address = req.params.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const badges = await Badge.find({ address }).lean();

    return res.json({
      address,
      badges: badges.map((b) => ({
        type: b.type,
        label: BADGE_DEFINITIONS[b.type]?.label || b.type,
        description: BADGE_DEFINITIONS[b.type]?.description || "",
        awardedAt: b.awardedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Evaluate and award all applicable badges for a wallet
 * Called internally after score calculation
 */
export async function evaluateAndAwardBadges(address, signalData) {
  const awarded = [];

  for (const [type, def] of Object.entries(BADGE_DEFINITIONS)) {
    try {
      const earned = await def.check({ ...signalData, address });

      if (earned) {
        await Badge.findOneAndUpdate(
          { address, type },
          { address, type, awardedAt: new Date() },
          { upsert: true, returnDocument: 'after' }
        );
        awarded.push(type);
      }
    } catch (err) {
      console.error(`[BadgeController] Error checking badge ${type}:`, err.message);
    }
  }

  return awarded;
}

export default { getBadges, evaluateAndAwardBadges };