import Post from '../models/Post.js';
import Notification from "../models/Notification.js"; // 👈 Sabse upar yahan likhein

// GET ALL POSTS (For Dashboard/Feed)
export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 }); // 🔥 -1 ka matlab hai "Latest Date & Time Sabse Upar"

    return res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Get Feed Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Search Posts
export const searchPosts = async (req, res) => {
  try {
    const searchQuery = req.query.q || "";
    const results = await Post.find({
      $or: [
        { caption: { $regex: searchQuery, $options: 'i' } },
        { hashtags: { $regex: searchQuery, $options: 'i' } }
      ]
    })
      .populate('author', 'username avatar name')
      .sort({ createdAt: -1 });

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 3. Get Posts by Topic (Orbit)
export const getPostsByTopic = async (req, res) => {
  try {
    const { domain } = req.params;
    console.log(`📡 Backend filtering for orbit: ${domain}`);

    const posts = await Post.find({
      orbit: { $regex: new RegExp(`^${domain}$`, 'i') }
    })
      .populate('author', 'username avatar name')
      .sort({ createdAt: -1 });

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// LIKE/UNLIKE POST (FIXED)
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    // 🔥 FIX: Ab hum frontend ka wait nahi karenge, direct token se ID nikal lenge
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check karo ki array mein is user ki id already hai ya nahi
    const index = post.likes.findIndex((likeId) => likeId.toString() === userId.toString());

    if (index === -1) {
      post.likes.push(userId); // Pehli baar kiya toh Like

      // Notification Logic
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id
        });
      }
    } else {
      post.likes.splice(index, 1); // Dobara click kiya toh Unlike (Remove)
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ADD COMMENT (UPDATED WITH NOTIFICATION)
export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ success: false, message: "Comment text is required." });
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    post.comments.push({ user: req.user.id, text: text.trim() });
    await post.save();
    await post.populate("comments.user", "name username avatar");
    const newComment = post.comments[post.comments.length - 1];

    // 🔥 NAYI CHEEZ: Notification trigger karo (Sirf tab jab doosre ki post ho) 🔥
    if (post.author.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: post.author,   // Post ka owner
        sender: req.user.id,      // Comment karne wala
        type: "comment",
        text: text.trim(),        // Kya comment kiya
        post: post._id
      });
    }

    return res.status(201).json({ success: true, comment: newComment, totalComments: post.comments.length });
  } catch (error) {
    console.error("❌ addComment error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// 5. CREATE A NEW POST
export const createPost = async (req, res) => {
  try {
    const { caption, image, hashtags, orbit, authorId } = req.body;

    if (!caption || !orbit || !authorId) {
      return res.status(400).json({ success: false, message: "Caption, Orbit, and Author are required." });
    }

    const newPost = await Post.create({
      caption,
      image: image || "",
      hashtags: hashtags || [],
      orbit,
      author: authorId
    });

    // Author ki details populate karna taaki frontend par naam/photo dikhe
    await newPost.populate('author', 'username name avatar');

    return res.status(201).json({ success: true, message: "Post created successfully!", post: newPost });
  } catch (error) {
    console.error("❌ Create Post Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET POSTS BY SPECIFIC USER (For Profile Page)
// GET POSTS BY SPECIFIC USER (For Profile Page)
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;

    // 🔥 FIX: {} ki jagah { author: userId } lagaya
    const posts = await Post.find({ author: userId })
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 })
      .limit(10); 

    return res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Get User Posts Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET SINGLE POST BY ID
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar')
      .populate('comments.user', 'name username avatar');

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching single post:", error);
    res.status(500).json({ message: "Server Error" });
  }
};