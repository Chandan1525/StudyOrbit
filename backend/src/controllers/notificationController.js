import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name username avatar')
      .populate('post', 'caption image');
      
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};