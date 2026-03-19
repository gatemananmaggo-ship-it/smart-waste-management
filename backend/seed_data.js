const mongoose = require('mongoose');
const Bin = require('./models/Bin');
require('dotenv').config();

const sampleBins = [
    {
        hardwareId: 'BIN-001',
        address: 'Central Park North',
        fillLevel: 10,
        batteryLevel: 95,
        location: { latitude: 40.7850, longitude: -73.9682 },
        status: 'Empty'
    },
    {
        hardwareId: 'BIN-002',
        address: 'Times Square East',
        fillLevel: 85,
        batteryLevel: 42,
        location: { latitude: 40.7588, longitude: -73.9851 },
        status: 'Filling'
    }
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding');

        await Bin.deleteMany({}); // Optional: clear existing
        await Bin.insertMany(sampleBins);

        console.log('Database seeded with sample bins');
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    }
}

seed();
