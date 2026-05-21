import express from 'express';
import { sendMessage, getMessages } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js'; // Auth middleware zaroori hai!

const router = express.Router();

router.get('/:id', protect, getMessages); // Chat History layega
router.post('/:id', protect, sendMessage); // Naya message bhejega

export default router;