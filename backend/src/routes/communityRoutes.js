import express from 'express';
import { 
  getCommunityMessages, 
  saveCommunityMessage, 
  updateCommunityMessage, 
  deleteCommunityMessage,
  joinCommunity // 🔥 Imported the new function
} from '../controllers/communityController.js';

import { protect } from '../middleware/authMiddleware.js'; // Changed to use protect from import
import upload from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

router.get('/:communityId/messages', protect, getCommunityMessages);
router.post('/:communityId/messages', protect, upload.single('image'), saveCommunityMessage);
router.put('/:communityId/messages/:messageId', protect, updateCommunityMessage);
router.delete('/:communityId/messages/:messageId', protect, deleteCommunityMessage);

// 🔥 JOIN ROUTE 🔥
router.post('/join/:id', protect, joinCommunity); // Use 'protect' instead of require middleware

export default router;