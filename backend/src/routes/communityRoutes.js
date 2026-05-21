import express from 'express';
import { 
  getCommunityMessages, 
  saveCommunityMessage, 
  updateCommunityMessage, // 👈 Naya
  deleteCommunityMessage  // 👈 Naya
} from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:communityId/messages', protect, getCommunityMessages);
router.post('/:communityId/messages', protect, saveCommunityMessage);

// 🔥 EDIT AUR DELETE WALE NAYE ROUTES 🔥
router.put('/:communityId/messages/:messageId', protect, updateCommunityMessage);
router.delete('/:communityId/messages/:messageId', protect, deleteCommunityMessage);

export default router;