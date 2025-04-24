// controllers/notificationController.js

const { Notification, User } = require('../models');

// Send all pending notifications
exports.sendPendingNotifications = async (req, res) => {
  try {
    const pending = await Notification.findAll({
      where: { status: 'PENDING' },
      include: [ User ]
    });
    let count = 0;
    for (const note of pending) {
      // TODO: integrate actual delivery (email/SMS) here
      note.status = 'SENT';
      note.sentAt = new Date();
      await note.save();
      count++;
    }
    res.status(200).json({ message: 'Pending notifications sent', count });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send notifications', error: error.message });
  }
};

// Retrieve notifications for the current user
exports.getUserNotifications = async (req, res) => {
  try {
    const notes = await Notification.findAll({
      where: { UserId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json({ message: 'Notifications retrieved', notifications: notes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
  }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const note = await Notification.findByPk(req.params.id);
    if (!note) return res.status(404).json({ message: 'Notification not found' });
    if (note.UserId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    note.status = 'READ';
    await note.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
};
