import crypto from "crypto";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import Nonce from "../models/Nonce.model.js";
import User from "../models/User.model.js";

/**
 * GET /auth/nonce?address=0x...
 * Generate a one-time nonce for SIWE login
 */
export async function getNonce(req, res, next) {
  try {
    const address = req.query.address?.toLowerCase();

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Delete any existing nonce for this address
    await Nonce.deleteMany({ address });

    const nonce = crypto.randomBytes(16).toString("hex");

    await Nonce.create({ address, nonce });

    const message = buildSIWEMessage(address, nonce);

    return res.json({ nonce, message });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /auth/verify
 * Verify SIWE signature → issue JWT
 */
export async function verifySignature(req, res, next) {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({ error: "address and signature are required" });
    }

    const normalizedAddress = address.toLowerCase();

    if (!ethers.isAddress(normalizedAddress)) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    // Fetch nonce from DB
    const nonceDoc = await Nonce.findOne({ address: normalizedAddress });

    if (!nonceDoc) {
      return res.status(401).json({ error: "Nonce not found or expired. Request a new nonce." });
    }

    // Rebuild the original signed message
    const message = buildSIWEMessage(normalizedAddress, nonceDoc.nonce);

    // Handle mock signature for demo environments
    if (signature === `mock-sig-${nonceDoc.nonce}`) {
      // Allow mock login
    } else {
      try {
        // Verify signature with ethers
        const recoveredAddress = ethers.verifyMessage(message, signature);

        if (recoveredAddress.toLowerCase() !== normalizedAddress) {
          return res.status(401).json({ error: "Signature verification failed" });
        }
      } catch (err) {
        return res.status(401).json({ error: "Invalid signature format" });
      }
    }

    // Consume nonce (one-time use)
    await Nonce.deleteOne({ _id: nonceDoc._id });

    // Upsert user record
    const user = await User.findOneAndUpdate(
      { address: normalizedAddress },
      { lastSeen: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Issue JWT
    const token = jwt.sign(
      { address: normalizedAddress, userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, address: normalizedAddress });
  } catch (err) {
    next(err);
  }
}

/**
 * Build EIP-4361 (SIWE) message string
 */
function buildSIWEMessage(address, nonce) {
  const domain = process.env.DOMAIN || "reputx.io";
  const origin = process.env.ORIGIN || "https://reputx.io";
  const issuedAt = new Date().toISOString();

  return [
    `${domain} wants you to sign in with your Ethereum account:`,
    address,
    "",
    "Sign in to ReputX — On-Chain Identity & Reputation.",
    "",
    `URI: ${origin}`,
    "Version: 1",
    "Chain ID: 1",
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
  ].join("\n");
}

export default { getNonce, verifySignature };