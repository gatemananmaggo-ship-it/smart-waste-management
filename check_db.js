const mongoose = require('mongoose');
const User = require('./backend/models/User');
const Bin = require('./backend/models/Bin');
require('dotenv').config({ path: './backend/.env' });

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => console.log(` - ID: ${u._id}, Username: ${u.username}, HubID: ${u.hubId}`));

        const bins = await Bin.find({});
        console.log(`\nFound ${bins.length} bins:`);
        bins.forEach(b => console.log(` - HardwareID: ${b.hardwareId}, Owner: ${b.owner}, Address: ${b.address}`));

        if (users.length > 0) {
            const firstUserBins = await Bin.find({ owner: users[0]._id });
            console.log(`\nBins for first user (${users[0].username}): ${firstUserBins.length}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDatabase();
