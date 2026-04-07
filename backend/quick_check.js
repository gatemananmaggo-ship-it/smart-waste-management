const mongoose = require('mongoose');
require('dotenv').config();
const Worker = require('./models/Worker');
const Bin = require('./models/Bin');

async function checkData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const workers = await Worker.find({});
        console.log(`Found ${workers.length} workers:`);
        workers.forEach(w => {
            console.log(` - ${w.username} (Hub: ${w.linkedHubId}, Phone: ${w.phone}, Location: ${JSON.stringify(w.location)})`);
        });

        const bins = await Bin.find({}).limit(5);
        console.log(`Found ${bins.length} bins:`);
        bins.forEach(b => {
            console.log(` - ID: ${b.hardwareId}, Address: ${b.address}, Location: ${JSON.stringify(b.location)}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkData();
