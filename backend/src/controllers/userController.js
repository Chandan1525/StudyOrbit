import User from '../models/User.js';
import Message from '../models/Message.js';
import Notification from "../models/Notification.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user.id;

    // 1. Current user ka data fetch karo taaki uske connections mil sakein
    const currentUser = await User.findById(loggedInUserId);
    if (!currentUser) {
      return res.status(404).json({ message: "Current user not found" });
    }

    // 2. Followers aur Following arrays ko combine karo (Duplicates hatane ke liye Set ka use kiya)
    const connectedUserIds = [
      ...new Set([
        ...currentUser.followers.map(id => id.toString()),
        ...currentUser.following.map(id => id.toString())
      ])
    ];

    // 3. Sirf wahi users nikalo jinki ID 'connectedUserIds' mein hai (aur khud ko exclude karo)
    const users = await User.find({
      _id: { $in: connectedUserIds, $ne: loggedInUserId }
    }).select("-password");
    console.log("Connected User IDs:", connectedUserIds);
    console.log("Users sent to frontend:", users.length);

    // 4. Current user ke saare messages nikalo (Latest sabse pehle)
    const messages = await Message.find({
      $or: [{ sender: loggedInUserId }, { receiver: loggedInUserId }]
    }).sort({ createdAt: -1 });

    // 5. Har user ka aakhri (latest) message time ek Map mein save karo
    const lastMessageMap = new Map();
    messages.forEach((msg) => {
      const otherUserId = msg.sender.toString() === loggedInUserId.toString()
        ? msg.receiver.toString()
        : msg.sender.toString();

      if (!lastMessageMap.has(otherUserId)) {
        lastMessageMap.set(otherUserId, msg.createdAt.getTime());
      }
    });

    // 6. Users ko us time ke hisaab se Sort karo (Jisse latest baat hui, wo No. 1 par)
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
    
    // 🔥 YAHAN POPULATE ADD KIYA HAI 🔥
    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "name username avatar")
      .populate("following", "name username avatar");

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
        followers: user.followers || [],
        // 🔥 PEHLE YAHAN SIRF LENGTH THI, AB POORA ARRAY BHEJ RAHE HAIN 🔥
        following: user.following || [], 
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