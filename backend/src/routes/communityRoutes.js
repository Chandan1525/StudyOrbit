import express from 'express';
import { 
  getCommunityMessages, 
  saveCommunityMessage, 
  updateCommunityMessage, 
  deleteCommunityMessage 
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js'; // 🔥 Multer upload import kiya

const router = express.Router();

router.get('/:communityId/messages', protect, getCommunityMessages);

// 🔥 Route mein 'upload.single("image")' add kar diya 🔥
router.post('/:communityId/messages', protect, upload.single('image'), saveCommunityMessage);

router.put('/:communityId/messages/:messageId', protect, updateCommunityMessage);
router.delete('/:communityId/messages/:messageId', protect, deleteCommunityMessage);

export default router;