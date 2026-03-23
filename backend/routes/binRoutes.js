const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const BinHistory = require('../models/BinHistory');
const History = require('../models/History'); // New Hub-wide history
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const smsService = require('../utils/smsService');

// GET all bins for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching bins for user ID:', req.user.id);
        const bins = await Bin.find({ owner: req.user.id });
        console.log(`Found ${bins.length} bins for user ${req.user.id}`);
        
        // Fetch Hub-wide history for trends
        const user = await User.findById(req.user.id);
        if (!user) {
            console.log('User not found in DB with ID:', req.user.id);
            return res.status(404).json({ message: 'User not found' });
        }
        
        const history = await History.find({ hubId: user.hubId })
            .sort({ timestamp: -1 })
            .limit(30);

        res.json({ bins, history: history.reverse() });
    } catch (err) {
        console.error('Bin fetch backend error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET bins by Hub ID (Worker access - no auth needed)
router.get('/hub/:hubId', async (req, res) => {
    try {
        const user = await User.findOne({ hubId: req.params.hubId });
        if (!user) return res.status(404).json({ message: 'Hub not found' });
        
        const bins = await Bin.find({ owner: user._id });
        res.json(bins);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET single bin by ID
router.get('/:id', async (req, res) => {
    try {
        const bin = await Bin.findById(req.params.id);
        if (!bin) return res.status(404).json({ message: 'Bin not found' });
        res.json(bin);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST create a new bin
router.post('/', auth, async (req, res) => {
    try {
        const { hardwareId, address, location } = req.body;
        if (!hardwareId || !address || !location?.latitude || !location?.longitude) {
            return res.status(400).json({ message: 'hardwareId, address, location.latitude and location.longitude are required.' });
        }
        const bin = new Bin({ 
            hardwareId, 
            address, 
            location, 
            fillLevel: 0, 
            batteryLevel: 100, 
            status: 'Empty',
            owner: req.user.id 
        });
        const savedBin = await bin.save();
        const io = req.app.get('io');
        if (io) {
            const ownerUser = await User.findById(savedBin.owner);
            if (ownerUser) {
                io.to(ownerUser.hubId).emit('binUpdate', savedBin);
            }
        }
        res.status(201).json(savedBin);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A bin with this Hardware ID already exists.' });
        }
        res.status(400).json({ message: err.message });
    }
});

// PATCH update bin status
router.patch('/:hardwareId', async (req, res) => {
    try {
        const { fillLevel, batteryLevel, status } = req.body;
        const bin = await Bin.findOneAndUpdate(
            { hardwareId: req.params.hardwareId },
            {
                fillLevel,
                batteryLevel,
                status,
                lastUpdated: Date.now()
            },
            { new: true }
        );

        if (!bin) return res.status(404).json({ message: 'Bin not found' });

        // Log to history
        const history = new BinHistory({
            binId: bin._id,
            fillLevel: bin.fillLevel,
            batteryLevel: bin.batteryLevel
        });
        await history.save();

        // Emit socket event
        const io = req.app.get('io');
        if (io) {
            const ownerUser = await User.findById(bin.owner);
            if (ownerUser) {
                io.to(ownerUser.hubId).emit('binUpdate', bin);

                // Update Hub History (Average fill level)
                const allBins = await Bin.find({ owner: bin.owner });
                const avgFill = allBins.reduce((sum, b) => sum + b.fillLevel, 0) / allBins.length;
                
                const hubHistory = new History({
                    hubId: ownerUser.hubId,
                    averageFillLevel: Math.round(avgFill)
                });
                await hubHistory.save();
                
                // Also emit trend update
                io.to(ownerUser.hubId).emit('trendUpdate', {
                    timestamp: hubHistory.timestamp,
                    fillLevel: hubHistory.averageFillLevel
                });
            }
        }

        // Trigger SMS alert if fill level is high
        if (fillLevel >= 90) {
            const ownerUser = await User.findById(bin.owner);
            if (ownerUser && ownerUser.phone) {
                console.log(`Triggering SMS alert for bin ${bin.hardwareId} at ${fillLevel}%`);
                smsService.sendFullBinAlert(ownerUser.phone, bin.hardwareId, bin.address)
                    .catch(err => console.error('Failed to send SMS:', err.message));
            }
        }

        res.json(bin);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a bin
router.delete('/:hardwareId', async (req, res) => {
    try {
        const bin = await Bin.findOneAndDelete({ hardwareId: req.params.hardwareId });
        if (!bin) return res.status(404).json({ message: 'Bin not found' });
        res.json({ message: 'Bin deleted successfully', hardwareId: req.params.hardwareId });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET history for a bin
router.get('/:binId/history', async (req, res) => {
    try {
        const history = await BinHistory.find({ binId: req.params.binId }).sort({ timestamp: -1 }).limit(50);
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
