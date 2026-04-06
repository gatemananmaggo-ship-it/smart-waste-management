const express = require('express');
const router = express.Router();
const Worker = require('../models/Worker');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

// GET all workers for the logged-in user's hub
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const workers = await Worker.find({ linkedHubId: user.hubId }).select('-password');
        res.json(workers);
    } catch (err) {
        console.error('Worker fetch error:', err);
        res.status(500).json({ message: err.message });
    }
});

// POST append a new worker
router.post('/', auth, async (req, res) => {
    try {
        const { username, password, phone } = req.body;
        
        if (!username || !password || !phone) {
            return res.status(400).json({ message: 'Username, password, and phone number are required.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newWorker = new Worker({
            username,
            password: hashedPassword,
            phone,
            linkedHubId: user.hubId
        });

        const savedWorker = await newWorker.save();
        
        // Return without password
        const workerObj = savedWorker.toObject();
        delete workerObj.password;
        
        res.status(201).json(workerObj);
    } catch (err) {
        console.error('Worker create error:', err);
        res.status(500).json({ message: err.message });
    }
});

// DELETE a worker
router.delete('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const worker = await Worker.findOneAndDelete({ _id: req.params.id, linkedHubId: user.hubId });
        
        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }
        res.json({ message: 'Worker deleted successfully' });
    } catch (err) {
        console.error('Worker delete error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
