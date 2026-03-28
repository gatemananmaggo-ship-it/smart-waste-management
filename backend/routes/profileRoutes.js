const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// @route   PUT api/profile/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both current and new passwords' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during password change' });
    }
});

// @route   PUT api/profile/update-phone
// @desc    Update user phone number
// @access  Private
router.put('/update-phone', auth, async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Please provide a phone number' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.phone = phone;
        await user.save();

        res.json({ 
            message: 'Phone number updated successfully',
            phone: user.phone
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during phone update' });
    }
});

// @route   PUT api/profile/update-availability
// @desc    Update worker availability for SMS notifications
// @access  Private
router.put('/update-availability', auth, async (req, res) => {
    try {
        const { isAvailable } = req.body;

        if (isAvailable === undefined) {
            return res.status(400).json({ message: 'Please provide availability status' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isAvailable = isAvailable;
        await user.save();

        res.json({ 
            message: 'Availability updated successfully',
            isAvailable: user.isAvailable
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during availability update' });
    }
});

// @route   PUT api/profile/link-hub
// @desc    Link this worker account to a hub for SMS alerts
// @access  Private
router.put('/link-hub', auth, async (req, res) => {
    try {
        const { hubId } = req.body;

        if (!hubId) {
            return res.status(400).json({ message: 'Please provide a Hub ID' });
        }

        // Verify the hub exists
        const hubOwner = await User.findOne({ hubId });
        if (!hubOwner) {
            return res.status(404).json({ message: 'Hub not found. Please check the Hub ID.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.linkedHubId = hubId;
        await user.save();

        res.json({ 
            message: 'Successfully linked to hub',
            linkedHubId: user.linkedHubId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during hub link' });
    }
});

// @route   PUT api/profile/unlink-hub
// @desc    Unlink this worker from their current hub
// @access  Private
router.put('/unlink-hub', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.linkedHubId = null;
        await user.save();

        res.json({ message: 'Successfully unlinked from hub' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during hub unlink' });
    }
});

module.exports = router;
