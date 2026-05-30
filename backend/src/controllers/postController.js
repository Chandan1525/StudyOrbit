import Post from '../models/Post.js';
import Notification from "../models/Notification.js";
import User from '../models/User.js';

export const getFeed = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username name avatar')
      .sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Get Feed Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(200).json([]);

    let userQuery = {};
    let isUsernameSearch = false;

    if (q.startsWith('@')) {
      isUsernameSearch = true;
      const exactUsername = q.substring(1);
      userQuery = { username: { $regex: exactUsername, $options: 'i' } };
    } else {
      userQuery = {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);

    let postQuery = {};

    if (isUsernameSearch) {
      postQuery = { author: { $in: userIds } };
    } else {
      postQuery = {
        $or: [
          { author: { $in: userIds } },
          { caption: { $regex: q, $options: 'i' } },
          { hashtags: { $regex: q, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(postQuery)
      .populate('author', 'name username avatar')
      .populate('comments.user', 'name username avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPostsByTopic = async (req, res) => {
  try {
    const { domain } = req.params;
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

export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.findIndex((likeId) => likeId.toString() === userId.toString());

    if (index === -1) {
      post.likes.push(userId);
      if (post.author.toString() !== userId.toString()) {
        await Notification.create({
          recipient: post.author,
          sender: userId,
          type: "like",
          post: post._id
        });
      }
    } else {
      post.likes.splice(index, 1);
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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

    if (post.author.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: "comment",
        text: text.trim(),
        post: post._id
      });
    }

    return res.status(201).json({ success: true, comment: newComment, totalComments: post.comments.length });
  } catch (error) {
    console.error("❌ addComment error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

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

    await newPost.populate('author', 'username name avatar');
    return res.status(201).json({ success: true, message: "Post created successfully!", post: newPost });
  } catch (error) {
    console.error("❌ Create Post Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    // 👇 Yahan .limit(10) laga hoga jiski wajah se error aa raha hai
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("❌ Get User Posts Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized to delete this post" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({ message: "Server Error: Could not delete post" });
  }
};


// 🔥 NEW: Toggle Save Post (FIXED ID COMPARISON)
export const toggleSavePost = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.id;

    // Use .some() to safely compare Mongoose ObjectIds with strings
    const isSaved = user.savedPosts.some(id => id.toString() === postId.toString());

    if (isSaved) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId.toString());
    } else {
      user.savedPosts.push(postId);
    }

    await user.save();
    res.status(200).json({ savedPosts: user.savedPosts });
  } catch (error) {
    console.error("Save Post Error:", error);
    res.status(500).json({ message: "Server Error: Could not save post" });
  }
};

// 🔥 NEW: Get Saved Posts (FIXED NULL FILTERING)
export const getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      populate: { path: 'author', select: 'name username avatar' }
    });

    // Filter out any posts that might have been deleted, then reverse
    const validSavedPosts = user.savedPosts.filter(post => post !== null).reverse();

    res.status(200).json(validSavedPosts);
  } catch (error) {
    console.error("Get Saved Posts Error:", error);
    res.status(500).json({ message: "Server Error: Could not fetch saved posts" });
  }
};