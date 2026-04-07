const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();
const Bin = require('./models/Bin');
const Worker = require('./models/Worker');

const API_URL = 'http://localhost:5000/api/bins';

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const binId = 'Bin-003';
        const targetBin = await Bin.findOne({ hardwareId: binId });
        if (!targetBin) throw new Error('Test bin not found');

        console.log(`Setting fill level of ${binId} to 95%...`);
        const patchRes = await axios.patch(`${API_URL}/${binId}`, {
            fillLevel: 95,
            batteryLevel: 80,
            status: 'Full'
        });

        console.log('Bin updated, waiting for assignment logic...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        const updatedBin = await Bin.findOne({ hardwareId: binId }).populate('assignedWorker');
        if (updatedBin.assignedWorker) {
            console.log('SUCCESS: Bin assigned to worker:', updatedBin.assignedWorker.username);
        } else {
            console.log('FAILURE: Bin was not assigned.');
        }

        console.log('Setting fill level to 5% to clear assignment...');
        await axios.patch(`${API_URL}/${binId}`, {
            fillLevel: 5,
            batteryLevel: 80,
            status: 'Empty'
        });

        await new Promise(resolve => setTimeout(resolve, 1000));
        const clearedBin = await Bin.findOne({ hardwareId: binId });
        if (clearedBin.assignedWorker === null) {
            console.log('SUCCESS: Assignment cleared.');
        } else {
            console.log('FAILURE: Assignment was not cleared.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err.message);
        if (err.response) console.error('Response data:', err.response.data);
        process.exit(1);
    }
}

runTest();
