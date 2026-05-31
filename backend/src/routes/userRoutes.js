import express from 'express';
// 🔥 Import changePassword 🔥
import { getUsersForSidebar, getUserProfile, toggleFollow, addProject, editProject, deleteProject, changePassword } from '../controllers/userController.js'; 
import { protect } from '../middleware/authMiddleware.js';
import { updateProfile } from "../controllers/authController.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { updatePrivacySettings, deleteAccount } from '../controllers/userController.js';

const router = express.Router();

// 🔥 NEW ROUTE: CHANGE PASSWORD 🔥
router.put('/change-password', protect, changePassword);

router.get('/sidebar', protect, getUsersForSidebar); 
router.put("/update-profile", updateProfile);
router.get('/profile/:id', getUserProfile);
router.put('/follow/:id', protect, toggleFollow);

// ── PROJECT ROUTES ──
router.post('/project', protect, addProject);
router.put('/project/:projectId', protect, editProject);
router.delete('/project/:projectId', protect, deleteProject);

router.put('/privacy', protect, updatePrivacySettings);
router.delete('/account', protect, deleteAccount);

// ── CONNECTED DEVICES (SESSIONS) KE LIYE ──
router.get("/sessions", protect, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const currentSessionId = decoded.sessionId; 

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const activeSessions = user.sessions || [];

    const formattedSessions = activeSessions.map(s => {
      let deviceName = "Unknown Device";
      if (s.device.includes("Windows")) deviceName = "Windows PC";
      else if (s.device.includes("Macintosh") || s.device.includes("Mac OS")) deviceName = "MacBook / iMac";
      else if (s.device.includes("iPhone") || s.device.includes("iPad")) deviceName = "Apple iOS Device";
      else if (s.device.includes("Android")) deviceName = "Android Mobile";
      else deviceName = "Web Browser";

      return {
        id: s.sessionId,
        name: deviceName,
        time: new Date(s.loginTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        active: s.sessionId === currentSessionId, 
      };
    });

    res.json({ sessions: formattedSessions });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/sessions/:sessionId", protect, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    await User.findByIdAndUpdate(userId, {
      $pull: { sessions: { sessionId: req.params.sessionId } }
    });
    res.json({ success: true, message: "Device session revoked successfully" });
  } catch (error) {
    console.error("Error revoking session:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ── FOR EXPLORE/SEARCH PAGE ──
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    console.error("💥 Error fetching users:", error);
    res.status(500).json({ message: "Server error fetching users" });
  }
});

export default router;