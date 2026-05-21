import express from 'express';
import { 
  getFeed, searchPosts, getPostsByTopic, likePost, 
  createPost, getUserPosts, addComment, getPostById 
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
import Post from "../models/Post.js";

// 1. Specific Routes (Yeh hamesha upar hone chahiye)
router.get('/feed', protect, getFeed);
router.get('/search', protect, searchPosts);
router.get('/topic/:domain', protect, getPostsByTopic);
router.get('/user/:userId', protect, getUserPosts);

// 2. Action Routes
router.put('/like/:id', protect, likePost);
router.post('/:id/comments', protect, addComment);
router.post('/', protect, createPost);

// 3. Dynamic ID Route (Yeh HAMESHA aakhir mein hona chahiye)
router.get('/:id', protect, getPostById); 

router.get("/", async (req, res) => {
  try {
    // Agar author field ka naam alag hai toh error aa sakta hai, isliye abhi simple find() karte hain
    const posts = await Post.find().populate("author", "name username avatar");
    res.json(posts);
  } catch (error) {
    console.error("💥 Error fetching posts:", error); // Ye line terminal mein asli error batayegi
    res.status(500).json({ message: "Server error fetching posts" });
  }
});
export default router;