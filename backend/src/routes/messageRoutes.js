import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // 🔥 Import Multer Upload

const router = express.Router();

router.get('/:id', protect, getMessages); 

// 🔥 Add upload.single('image') before your controller
// This tells Express to look for a file attached with the key 'image'
router.post('/:id', protect, upload.single('image'), sendMessage); 

export default router;