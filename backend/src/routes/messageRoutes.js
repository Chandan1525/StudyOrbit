import express from 'express';
import { sendMessage, getMessages, editMessage, deleteMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

router.get('/:id', protect, getMessages); 
router.post('/:id', protect, upload.single('image'), sendMessage); 

// 🔥 Edit & Delete Routes (Here, :id refers to the message ID)
router.put('/:id', protect, editMessage);
router.delete('/:id', protect, deleteMessage);

export default router;