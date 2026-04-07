const express = require('express');
const router = express.Router();
const Bin = require('../models/Bin');
const BinHistory = require('../models/BinHistory');
const History = require('../models/History'); // New Hub-wide history
const User = require('../models/User');
const Worker = require('../models/Worker');
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');
const smsService = require('../utils/smsService');
const { calculateDistance } = require('../utils/geoUtils');

// GET all bins for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        console.log('Fetching bins for user ID:', req.user.id);
        const bins = await Bin.find({ owner: req.user.id }).populate('assignedWorker', 'username');
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
            { returnDocument: 'after' }
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

        // Handle Worker Allocation and Clearing
        if (fillLevel >= 90) {
            const ownerUser = await User.findById(bin.owner);
            if (ownerUser) {
                // Find all workers linked to this hub who are available
                const linkedWorkers = await Worker.find({
                    linkedHubId: ownerUser.hubId,
                    isAvailable: { $ne: false },
                    phone: { $exists: true, $ne: '' }
                });

                // Calculate distances for all available workers (who have location data)
                const workersWithDistance = linkedWorkers
                    .filter(w => w.location?.latitude && w.location?.longitude)
                    .map(worker => ({
                        id: worker._id,
                        name: worker.username,
                        phone: worker.phone,
                        distance: calculateDistance(
                            bin.location.latitude,
                            bin.location.longitude,
                            worker.location.latitude,
                            worker.location.longitude
                        )
                    }));

                // Sort by distance (ascending)
                workersWithDistance.sort((a, b) => a.distance - b.distance);

                const recipients = [];
                if (ownerUser.phone) {
                    recipients.push({ 
                        id: ownerUser._id, 
                        name: 'Admin', 
                        phone: ownerUser.phone, 
                        type: 'User' 
                    });
                }

                let selectedWorker = null;
                
                // Add the closest worker if available
                if (workersWithDistance.length > 0) {
                    selectedWorker = workersWithDistance[0];
                    recipients.push({
                        id: selectedWorker.id,
                        name: selectedWorker.name,
                        phone: selectedWorker.phone,
                        type: 'Worker'
                    });
                    console.log(`[Algorithm] Selected closest worker: ${selectedWorker.name} (${selectedWorker.distance.toFixed(2)} km away)`);
                } else if (linkedWorkers.length > 0) {
                    // Fallback: Notify all if no location data
                    linkedWorkers.forEach(worker => {
                        recipients.push({ 
                            id: worker._id, 
                            name: worker.username, 
                            phone: worker.phone, 
                            type: 'Worker' 
                        });
                    });
                    console.log(`[Algorithm] No workers have location data. Alerting all ${linkedWorkers.length} available workers.`);
                }

                // PERSIST ASSIGNMENT
                if (selectedWorker) {
                    await Bin.findByIdAndUpdate(bin._id, {
                        assignedWorker: selectedWorker.id,
                        assignedAt: Date.now(),
                        status: 'Full'
                    });
                }

                if (recipients.length > 0) {
                    console.log(`[SMS] Triggering alerts for bin ${bin.hardwareId} (${fillLevel}%) to ${recipients.length} recipient(s)`);
                    recipients.forEach(recipient => {
                        // 1. Send SMS
                        smsService.sendFullBinAlert(recipient.phone, bin.hardwareId, bin.address)
                            .then(() => console.log(`[SMS] Success: Sent to ${recipient.name} at ${recipient.phone}`))
                            .catch(err => console.error(`[SMS] Failed: Could not send to ${recipient.name}:`, err.message));
                        
                        // 2. Create In-App Notification
                        if (recipient.id) {
                            const newNotif = new Notification({
                                recipientId: recipient.id,
                                recipientType: recipient.type,
                                binId: bin.hardwareId,
                                message: `Alert: Bin ${bin.hardwareId} is ${fillLevel}% full. Location: ${bin.address}.`,
                                status: fillLevel >= 100 ? 'Full' : 'High Level'
                            });
                            newNotif.save()
                                .then(() => console.log(`[In-App Notification] Created for ${recipient.name}`))
                                .catch(err => console.error(`[In-App Notification] Failed:`, err.message));
                        }
                    });
                }
            }
        } else if (fillLevel < 10) {
            // Clear assignment if bin is emptied
            if (bin.assignedWorker) {
                console.log(`[Algorithm] Bin ${bin.hardwareId} emptied. Clearing assignment for worker ${bin.assignedWorker}`);
                await Bin.findByIdAndUpdate(bin._id, {
                    assignedWorker: null,
                    assignedAt: null,
                    status: 'Empty'
                });
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
