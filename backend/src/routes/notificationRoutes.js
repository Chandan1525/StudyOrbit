import express from 'express';
// Tumhara auth middleware import jaisa tha waisa hi rehne dena (e.g., protect)
import { protect } from '../middleware/authMiddleware.js'; 

// 🔥 NAYE FUNCTIONS YAHAN IMPORT KARNE HAIN 🔥
import { 
  getNotifications, 
  markAsRead, 
  deleteAllNotifications, 
  deleteSingleNotification 
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/read', protect, markAsRead);
router.delete("/all", protect, deleteAllNotifications);
router.delete("/:id", protect, deleteSingleNotification);

export default router;