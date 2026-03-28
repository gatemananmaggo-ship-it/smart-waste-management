const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Middleware: only allow admins
const adminOnly = async (req, res, next) => {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};

// @route   GET /api/workers
// @desc    Get all workers created by this admin
// @access  Admin only
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const admin = await User.findById(req.user.id);
        const workers = await User.find({ createdBy: req.user.id, role: 'worker' })
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(workers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/workers
// @desc    Admin creates a new worker account
// @access  Admin only
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { username, phone, password } = req.body;

        if (!username || !phone || !password) {
            return res.status(400).json({ message: 'Username, phone, and password are required' });
        }

        // Check if username already taken
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ message: 'Username already taken' });
        }

        const admin = await User.findById(req.user.id);

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const worker = new User({
            username,
            phone,
            password: hashedPassword,
            role: 'worker',
            email: `${username}@worker.ecosmart`,  // placeholder email for workers
            area_access: admin.area_access,
            state: admin.state,
            city: admin.city,
            place: admin.place,
            hubId: `W-${Date.now()}`,  // unique but not used for routing
            linkedHubId: admin.hubId,  // pre-linked to admin's hub
            createdBy: admin._id,
            isAvailable: true,
        });

        await worker.save();

        res.status(201).json({
            message: 'Worker created successfully',
            worker: {
                id: worker._id,
                username: worker.username,
                phone: worker.phone,
                isAvailable: worker.isAvailable,
                linkedHubId: worker.linkedHubId,
                createdAt: worker.createdAt,
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during worker creation' });
    }
});

// @route   PATCH /api/workers/:id/availability
// @desc    Admin toggles worker availability
// @access  Admin only
router.patch('/:id/availability', auth, adminOnly, async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const worker = await User.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id, role: 'worker' },
            { isAvailable },
            { new: true }
        ).select('-password');

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.json({ message: 'Availability updated', worker });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/workers/:id
// @desc    Admin removes a worker
// @access  Admin only
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const worker = await User.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id,
            role: 'worker'
        });

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        res.json({ message: 'Worker removed successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
