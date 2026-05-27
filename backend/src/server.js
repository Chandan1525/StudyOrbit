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
import notificationRoutes from './routes/notificationRoutes.js'; // .js lagana zaroori hai!

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
      "https://study-orbit-taupe.vercel.app" // 🔥 Tumhara Vercel domain yahan add ho gaya
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Jo online users ko track karega (Green Dot ke liye)
const onlineUsers = new Map(); // socket.id -> userId

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // ==========================================
  // 1. GLOBAL & PERSONAL CHAT LOGIC
  // ==========================================

  // Jab koi naya user app open karega
  socket.on("add_user", (userId) => {
    onlineUsers.set(socket.id, userId);
    // Sabko update bhej do ki naya list kya hai
    io.emit("get_online_users", Array.from(onlineUsers.values()));
  });

  // Personal message bhejna
  socket.on("send_message", (data) => {
    // ❌ Pehle: io.emit("receive_message", data);  <- Ye sabko bhejta tha (Aapko bhi)
    // ✅ Ab: socket.broadcast.emit karna hai <- Ye aapko chhod kar baaki sabko bhejega
    socket.broadcast.emit("receive_message", data);
  });

  // ==========================================
  // 2. COMMUNITY CHAT (ROOMS) LOGIC 🔥
  // ==========================================

  // Jab user koi community (jaise "AI & ML") join kare
  socket.on("join_community", (channelName) => {
    socket.join(channelName);
    console.log(`👥 User ${socket.id} joined community: ${channelName}`);
  });

  // Jab user doosri community par switch kare
  socket.on("leave_community", (channelName) => {
    socket.leave(channelName);
    console.log(`🚪 User ${socket.id} left community: ${channelName}`);
  });

  // Community mein message broadcast karna
  socket.on("send_community_message", (data) => {
    // ❌ Pehle: io.to(data.channel).emit(...) <- Sabko bhejta tha
    // ✅ Ab: socket.to(data.channel).emit(...) <- Sirf room walo ko, aapko chhod kar!
    socket.to(data.channel).emit("receive_community_message", data);
  });

  // Jab koi message edit kare
  socket.on("edit_community_message", (data) => {
    socket.to(data.channel).emit("message_edited", data);
  });

  // Jab koi message delete kare
  socket.on("delete_community_message", (data) => {
    socket.to(data.channel).emit("message_deleted", data);
  });


  // ==========================================
  // 3. DISCONNECT LOGIC
  // ==========================================

  // Jab koi app band karke jayega (Offline)
  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("get_online_users", Array.from(onlineUsers.values())); // Baki logo se green dot hata do
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

// --- 404 HANDLER (Keep this BELOW routes) ---
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

// 🚨 IMPORTANT CHANGE: app.listen ki jagah server.listen 🚨
server.listen(PORT, () => {
  console.log(`🚀 StudyOrbit backend & Socket.io running on port ${PORT}`);
});

export default app;