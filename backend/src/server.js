import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import http from "http";
import { Server } from "socket.io";

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

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 🔥 --- SOCKET.IO SETUP --- 🔥
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
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
    // 🔥 FIX 1: Hamesha String mein save karo taaki mismatch na ho
    onlineUsers.set(socket.id, String(userId));
    io.emit("get_online_users", Array.from(onlineUsers.values()));
  });

  // 🔥 UPDATED: Send message safely
  socket.on("send_message", (data) => {
    // Backend aur Frontend dono ki IDs ko strictly String bana lo
    const receiverId = String(data.receiver?._id || data.receiver);

    for (let [socketId, userId] of onlineUsers.entries()) {
      if (userId === receiverId) {
        io.to(socketId).emit("receive_message", data);
        // ❌ Yahan se 'break;' hata diya! 
        // Ab agar user 2 tabs/devices mein online hai, toh dono par message aayega.
      }
    }
  });

  // 🔥 UPDATED: Edit message safely
  socket.on("edit_message", (data) => {
    const receiverId = String(data.receiver?._id || data.receiver);

    for (let [socketId, userId] of onlineUsers.entries()) {
      if (userId === receiverId) {
        io.to(socketId).emit("message_edited", data);
      }
    }
  });

  // 🔥 UPDATED: Delete message safely
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
    
    // 🔥 NAYI LINE: Us room ke total connections nikal kar bhej do
    const roomSize = io.sockets.adapter.rooms.get(channelName)?.size || 1;
    io.to(channelName).emit("community_active_count", { channel: channelName, count: roomSize });
  });

  socket.on("leave_community", (channelName) => {
    socket.leave(channelName);
    console.log(`🚪 User ${socket.id} left community: ${channelName}`);
    
    // 🔥 NAYI LINE: Us room ke total connections nikal kar bhej do
    const roomSize = io.sockets.adapter.rooms.get(channelName)?.size || 0;
    io.to(channelName).emit("community_active_count", { channel: channelName, count: roomSize });
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
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --- RATE LIMITING ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: { success: false, message: "Too many attempts, please try again later." },
});

// --- ROUTES (CRITICAL ORDER) ---
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/posts", postRoutes);

app.use('/api/messages', messageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/notifications', notificationRoutes);


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
  res.status(500).json({ success: false, message: "Internal server error." });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 StudyOrbit backend & Socket.io running on port ${PORT}`);
});

export default app;