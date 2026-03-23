const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper to generate unique 8-digit hub ID
const generateHubId = () => {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, password, email, area_access, state, city, place, phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required for SMS alerts' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ message: 'Username or Email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique hubId
        let hubId;
        let isUnique = false;
        while (!isUnique) {
            hubId = generateHubId();
            const existingHub = await User.findOne({ hubId });
            if (!existingHub) isUnique = true;
        }

        // Create new user
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            area_access,
            state,
            city,
            place,
            phone,
            hubId
        });

        await newUser.save();
        res.status(201).json({ 
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                username: newUser.username,
                hubId: newUser.hubId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username, area: user.area_access, city: user.city, state: user.state, place: user.place, hubId: user.hubId },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                area: user.area_access,
                state: user.state,
                city: user.city,
                place: user.place,
                hubId: user.hubId
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;
