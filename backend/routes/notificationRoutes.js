const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

// @route   GET /api/notifications
// @desc    Get all notifications for the logged-in user/worker
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ 
            recipientId: req.user.id 
        }).sort({ createdAt: -1 }).limit(50);
        
        res.json(notifications);
    } catch (err) {
        console.error('Notification fetch error:', err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
// @access  Private
router.patch('/:id/read', auth, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        // Ensure the notification belongs to the requester
        if (notification.recipientId.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        
        notification.isRead = true;
        await notification.save();
        
        res.json(notification);
    } catch (err) {
        console.error('Notification update error:', err);
        res.status(500).json({ message: 'Server error updating notification' });
    }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications for the logged-in user as read
// @access  Private
router.patch('/read-all', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipientId: req.user.id, isRead: false },
            { $set: { isRead: true } }
        );
        
        res.json({ message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Notification bulk update error:', err);
        res.status(500).json({ message: 'Server error updating notifications' });
    }
});

module.exports = router;
