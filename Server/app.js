import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import reputationRoutes from "./routes/reputation.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import milestoneRoutes from "./routes/milestone.routes.js";
import { publicScoreAPI } from "./controllers/reputationController.js";
// import { apiLimiter, publicApiLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

const allowedOrigins = [
  process.env.CLIENT_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:3000",
  "https://reputx.aalsicoders.in",
];

// CORS — allow frontend origin
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.options("*", cors());

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// General rate limiter on all routes
// app.use(apiLimiter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

// Mount routes under /api prefix to avoid clashing with frontend SPA routes
app.use("/api/auth", authRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/milestones", milestoneRoutes);

// Public third-party API endpoint
// app.get("/api/score/:address", publicApiLimiter, publicScoreAPI);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Centralised error handler (must be last)
app.use(errorHandler);

export default app;