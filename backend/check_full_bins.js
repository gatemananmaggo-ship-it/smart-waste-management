require('dotenv').config();
const mongoose = require('mongoose');
const Bin = require('./models/Bin');

async function checkBins() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const bins = await Bin.find({ fillLevel: { $gte: 90 } });
        console.log(`Found ${bins.length} bins with fillLevel >= 90%`);
        bins.forEach(bin => {
            console.log(` - ID: ${bin.hardwareId}, Address: ${bin.address}, Level: ${bin.fillLevel}%`);
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkBins();
