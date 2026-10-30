import "dotenv/config";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose"; // 🔥 Added Mongoose for health check

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import messageRoutes from './routes/messageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();
connectDB();

const app = express();

app.set('trust proxy', 1);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "https://study-orbit-taupe.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

export const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (/\.vercel\.app$/.test(origin)) return true;
  if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(origin)) return true;
  return false;
};

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔥 --- SOCKET.IO SETUP --- 🔥
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "https://study-orbit-taupe.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const onlineUsers = new Map(); // socket.id -> userId

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

 // ==========================================
  // 1. GLOBAL & PERSONAL CHAT LOGIC
  // ==========================================

  socket.on("add_user", (userId) => {
    onlineUsers.set(socket.id, String(userId));
    io.emit("get_online_users", Array.from(onlineUsers.values()));
  });

  socket.on("send_message", (data) => {
    const receiverId = String(data.receiver?._id || data.receiver);

    for (let [socketId, userId] of onlineUsers.entries()) {
      if (userId === receiverId) {
        io.to(socketId).emit("receive_message", data);
      }
    }
  });

  socket.on("edit_message", (data) => {
    const receiverId = String(data.receiver?._id || data.receiver);

    for (let [socketId, userId] of onlineUsers.entries()) {
      if (userId === receiverId) {
        io.to(socketId).emit("message_edited", data);
      }
    }
  });

  socket.on("delete_message", (data) => {
    const receiverId = String(data.receiver?._id || data.receiver);
    
    for (let [socketId, userId] of onlineUsers.entries()) {
      if (userId === receiverId) {
        io.to(socketId).emit("message_deleted", data);
      }
    }
  });
  
// ==========================================
  // 2. COMMUNITY CHAT (ROOMS) LOGIC 🔥
  // ==========================================

  socket.on("join_community", (channelName) => {
    socket.join(channelName);
    console.log(`👥 User ${socket.id} joined community: ${channelName}`);
    
    const roomSize = io.sockets.adapter.rooms.get(channelName)?.size || 1;
    io.emit("community_active_count", { channel: channelName, count: roomSize });
  });

  socket.on("leave_community", (channelName) => {
    socket.leave(channelName);
    console.log(`🚪 User ${socket.id} left community: ${channelName}`);
    
    const roomSize = io.sockets.adapter.rooms.get(channelName)?.size || 0;
    io.emit("community_active_count", { channel: channelName, count: roomSize });
  });

  socket.on("send_community_message", (data) => {
    socket.to(data.channel).emit("receive_community_message", data);
  });

  socket.on("edit_community_message", (data) => {
    socket.to(data.channel).emit("message_edited", data);
  });

  socket.on("delete_community_message", (data) => {
    socket.to(data.channel).emit("message_deleted", data);
  });
  // ==========================================
  // 3. DISCONNECT LOGIC
  // ==========================================

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("get_online_users", Array.from(onlineUsers.values()));
    console.log("🔴 Socket disconnected:", socket.id);
  });
});


// --- MIDDLEWARE ---
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: false,
  })
);
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
};
app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- RATE LIMITING ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  validate: { xForwardedForHeader: false, trustProxy: false },
  message: { success: false, message: "Too many attempts, please try again later." },
});

// --- ROUTES (CRITICAL ORDER) ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);

app.use('/api/messages', messageRoutes);

app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);

// 🔥 ADDED HEALTH CHECK ROUTE FOR UPTIMEROBOT & GITHUB ACTIONS 🔥
app.get("/api/health", async (req, res) => {
  try {
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbState = mongoose.connection.readyState;
    
    // Asli magic yahan hai: Atlas ko ek blank ping bhej rahe hain jagane ke liye
    if (dbState === 1) {
      await mongoose.connection.db.admin().ping();
    }

    res.status(200).json({ 
      success: true, 
      message: "Backend is awake! 🚀",
      databaseStatus: dbState === 1 ? "Connected & Warm" : "Disconnected or Sleeping"
    });
  } catch (error) {
    console.error("Health Check DB Error:", error);
    res.status(500).json({ success: false, message: "Health check failed." });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "StudyOrbit Backend Running 🚀" });
});

// --- 404 HANDLER ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `❌ Route ${req.method} ${req.originalUrl} not found.`
  });
});

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  const origin = req.headers.origin;
  if (origin && isOriginAllowed(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.status(500).json({ success: false, message: err.message || "Internal server error." });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 StudyOrbit backend & Socket.io running on port ${PORT}`);
});

export default app;