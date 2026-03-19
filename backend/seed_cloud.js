const mongoose = require('mongoose');
const User = require('./models/User');
const Bin = require('./models/Bin');
const bcrypt = require('bcryptjs');

// REPLACE THIS with your actual Connection String if different
const MONGODB_URI = 'mongodb+srv://MananSinghMaggo:7LszMiqVzJ_WtY@cluster0.lp0ncvh.mongodb.net/smart-waste?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
    try {
        console.log('Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected!');

        // 1. Create a Test User/Hub
        const hubId = 'TESTHUB1';
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        // Remove existing test user if any
        await User.deleteOne({ hubId });
        
        const user = new User({
            username: 'tester',
            password: hashedPassword,
            hubId: hubId,
            city: 'Ghaziabad',
            state: 'UP',
            place: 'AKGEC'
        });
        
        const savedUser = await user.save();
        console.log(`Created User: ${savedUser.username} with Hub ID: ${savedUser.hubId}`);

        // 2. Create some Test Bins
        await Bin.deleteMany({ owner: savedUser._id });
        
        const bins = [
            {
                hardwareId: 'BIN-001',
                address: 'Main Gate, AKGEC',
                location: { latitude: 28.6757, longitude: 77.5020 },
                fillLevel: 85,
                batteryLevel: 90,
                status: 'Full',
                owner: savedUser._id
            },
            {
                hardwareId: 'BIN-002',
                address: 'Canteen Area',
                location: { latitude: 28.6740, longitude: 77.5035 },
                fillLevel: 30,
                batteryLevel: 85,
                status: 'Empty',
                owner: savedUser._id
            }
        ];

        await Bin.insertMany(bins);
        console.log('Created 2 test bins for your Hub!');
        
        console.log('\n--- SUCCESS ---');
        console.log(`You can now enter Hub ID: ${hubId} in your Mobile App.`);
        console.log('Username: tester / Password: password123 (for web UI later)');
        
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seed();
