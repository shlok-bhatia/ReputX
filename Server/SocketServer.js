import http from "http";
import { Server as SocketIO } from "socket.io";
import mongoose from "mongoose";
import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) throw new Error("MONGO_URI is not set in .env");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not set in .env");
if (!process.env.ALCHEMY_API_KEY) throw new Error("ALCHEMY_API_KEY is not set in .env");

// Create HTTP server
const server = http.createServer(app);

// Socket.io — real-time score updates
const io = new SocketIO(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible in controllers via app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Client joins its own wallet room to receive personalised events
  socket.on("join:wallet", (address) => {
    if (typeof address === "string" && address.startsWith("0x")) {
      socket.join(address.toLowerCase());
      console.log(`[Socket.io] ${socket.id} joined room: ${address.toLowerCase()}`);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Connect to MongoDB then start server
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("[MongoDB] Connected to Atlas");

    server.listen(PORT, () => {
      console.log(`[Server] ReputX API running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("[MongoDB] Connection failed:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[Server] SIGTERM received — shutting down gracefully");
  server.close(async () => {
    await mongoose.connection.close();
    console.log("[Server] Closed. Goodbye.");
    process.exit(0);
  });
});

export { io };