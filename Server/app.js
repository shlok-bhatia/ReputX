import express from "express";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import reputationRoutes from "./routes/reputation.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import badgeRoutes from "./routes/badge.routes.js";
import { publicScoreAPI } from "./controllers/reputationController.js";
import { apiLimiter, publicApiLimiter } from "./middleware/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";

// NOTE: Do NOT call connectDB() here — SocketServer.js handles the single
// MongoDB connection via mongoose.connect() before starting the server.

const app = express();

// Security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

// General rate limiter on all routes
app.use(apiLimiter);

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

// Public third-party API endpoint
app.get("/api/score/:address", publicApiLimiter, publicScoreAPI);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Centralised error handler (must be last)
app.use(errorHandler);

export default app;