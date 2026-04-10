import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Strict limiter for recalculate endpoint
export const recalculateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  keyGenerator: (req) => req.user?.address || ipKeyGenerator(req),
  message: { error: "Too many recalculation requests. Limit is 5 per hour." },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public score API limiter (for third-party dApps)
export const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  message: { error: "Rate limit exceeded on public API." },
  standardHeaders: true,
  legacyHeaders: false,
});

export default { recalculateLimiter, apiLimiter, publicApiLimiter };