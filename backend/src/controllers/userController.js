import User from '../models/User.js';
import Message from '../models/Message.js';
import Notification from "../models/Notification.js";
import bcrypt from 'bcryptjs'; // 🔥 NAYA IMPORT PASSWORD HASHING KE LIYE 🔥

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
        following: user.following || [], 
        projects: user.projects || [] 
      }
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const addProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { name, desc, tech, github, live } = req.body;

    const techArray = tech ? tech.split(',').map(t => t.trim()) : [];

    const gradients = [
      "linear-gradient(135deg,#1e1b4b,#312e81)",
      "linear-gradient(135deg,#064e3b,#065f46)",
      "linear-gradient(135deg,#4c1d95,#5b21b6)",
      "linear-gradient(135deg,#7c2d12,#9a3412)"
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newProject = {
      name,
      desc,
      tech: techArray,
      github,
      live,
      gradient: randomGradient,
      stars: 0
    };

    user.projects.unshift(newProject);
    await user.save();

    res.status(201).json({ success: true, project: newProject, message: "Project added successfully!" });
  } catch (error) {
    console.error("Add Project Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  EDIT AND DELETE PROJECT FUNCTIONS
// ─────────────────────────────────────────────────────────────────────
export const editProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { projectId } = req.params;
    const { name, desc, tech, github, live } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const projectIndex = user.projects.findIndex(p => p._id.toString() === projectId);
    if (projectIndex === -1) return res.status(404).json({ message: "Project not found" });

    if (name) user.projects[projectIndex].name = name;
    if (desc) user.projects[projectIndex].desc = desc;
    if (tech) user.projects[projectIndex].tech = typeof tech === 'string' ? tech.split(',').map(t => t.trim()) : tech;
    if (github !== undefined) user.projects[projectIndex].github = github;
    if (live !== undefined) user.projects[projectIndex].live = live;

    await user.save();
    res.status(200).json({ success: true, project: user.projects[projectIndex], message: "Project updated!" });
  } catch (error) {
    console.error("Edit Project Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { projectId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.projects = user.projects.filter(p => p._id.toString() !== projectId);
    await user.save();

    res.status(200).json({ success: true, message: "Project deleted successfully!" });
  } catch (error) {
    console.error("Delete Project Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────
//  TOGGLE FOLLOW / UNFOLLOW
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
      targetUser.followers = targetUser.followers.filter(id => id.toString() !== loggedInUserId.toString());
      currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId.toString());
    } else {
      targetUser.followers.push(loggedInUserId);
      currentUser.following.push(targetUserId);

      await Notification.create({
        recipient: targetUserId,  
        sender: loggedInUserId,   
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

// ─────────────────────────────────────────────────────────────────────
// 🔥 CHANGE PASSWORD (SECURE LOGIC) 🔥
// ─────────────────────────────────────────────────────────────────────
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id || req.user._id;

    // 1. Fetch user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Compare current password with hashed password in DB
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect. Please try again." });
    }

    // 3. Hash the new password securely
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update and save
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};