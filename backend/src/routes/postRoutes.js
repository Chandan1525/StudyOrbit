import express from 'express';
import { 
  getFeed, searchPosts, getPostsByTopic, likePost, 
  createPost, getUserPosts, addComment, getPostById,
  deletePost, toggleSavePost, getSavedPosts
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import Post from "../models/Post.js";

const router = express.Router();

// 1. Specific Routes (Yeh hamesha upar hone chahiye)
router.get('/feed', protect, getFeed);
router.get('/search', protect, searchPosts);
router.get('/topic/:domain', protect, getPostsByTopic);
router.get('/user/:userId', protect, getUserPosts);
router.get('/saved', protect, getSavedPosts); // 🔥 Must be ABOVE dynamic IDs

// 2. Action Routes
router.put('/like/:id', protect, likePost);
router.put('/save/:id', protect, toggleSavePost); // 🔥 Added Save action
router.post('/:id/comments', protect, addComment);
router.post('/', protect, createPost);

// 3. General Route
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().populate("author", "name username avatar");
    res.json(posts);
  } catch (error) {
    console.error("💥 Error fetching posts:", error); 
    res.status(500).json({ message: "Server error fetching posts" });
  }
});

// 4. Dynamic ID Routes (Yeh HAMESHA aakhir mein hona chahiye)
router.get('/:id', protect, getPostById); 
router.delete('/:id', protect, deletePost);

export default router;