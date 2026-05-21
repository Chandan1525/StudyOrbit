import User from '../models/User.js';
import Message from '../models/Message.js'; // 👈 Ye import zaroori hai
import Notification from "../models/Notification.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // 1. Saare users nikalo (khud ko chhod kar)
    const users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    // 2. Current user ke saare messages nikalo (Latest sabse pehle)
    const messages = await Message.find({
      $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }]
    }).sort({ createdAt: -1 });

    // 3. Har user ka aakhri (latest) message time ek Map mein save karo
    const lastMessageMap = new Map();
    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === loggedInUserId.toString() 
        ? msg.receiver.toString() 
        : msg.sender.toString();
        
      if (!lastMessageMap.has(otherUserId)) {
        lastMessageMap.set(otherUserId, msg.createdAt.getTime());
      }
    });

    // 4. Users ko us time ke hisaab se Sort karo (Jisse latest baat hui, wo No. 1 par)
    const sortedUsers = users.sort((a, b) => {
      const timeA = lastMessageMap.get(a._id.toString()) || 0;
      const timeB = lastMessageMap.get(b._id.toString()) || 0;
      return timeB - timeA; // Descending (Naya time upar)
    });

    return res.status(200).json(sortedUsers);
  } catch (error) {
    console.error("GetUsers Error:", error);
    return res.status(500).json({ message: error.message });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  GET PUBLIC USER PROFILE BY ID (UPDATED)
// ─────────────────────────────────────────────────────────────────────
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id; 
    const user = await User.findById(userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio || user.about || "",
        location: user.location,
        skills: user.skills || [],
        website: user.website,
        github: user.github,
        linkedin: user.linkedin,
        coverGradient: user.coverGradient,
        // 🔥 Yahan dhyaan de: length ki jagah pura array bhej rahe hain
        followers: user.followers || [], 
        following: user.following?.length || 0,
      }
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE FOLLOW / UNFOLLOW (FIXED VERSION)
// ─────────────────────────────────────────────────────────────────────
export const toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id; 
    const loggedInUserId = req.user.id; 

    if (targetUserId === loggedInUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(loggedInUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.some(
      (id) => id.toString() === loggedInUserId.toString()
    );

    if (isFollowing) {
      // UNFOLLOW LOGIC
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== loggedInUserId.toString());
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    } else {
      // FOLLOW LOGIC
      targetUser.followers.push(loggedInUserId);
      currentUser.following.push(targetUserId);

      // 🔥 NAYI CHEEZ: Notification create karo jab koi follow kare 🔥
      await Notification.create({
        recipient: targetUserId,  // Jisko notification milegi (Target User)
        sender: loggedInUserId,   // Jisne follow kiya (Current User)
        type: "follow"
      });
    }

    await targetUser.save();
    await currentUser.save();

    res.status(200).json({ 
      success: true, 
      isFollowing: !isFollowing, 
      followersCount: targetUser.followers.length,
      followingCount: currentUser.following.length 
    });
  } catch (error) {
    console.error("Follow Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};