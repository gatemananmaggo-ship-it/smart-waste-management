const mongoose = require('mongoose');
const User = require('./models/User');
const Bin = require('./models/Bin');
require('dotenv').config();

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
            console.log('\n--- BIN OWNERSHIP CHECK ---');
            for (const user of users) {
                const userBins = await Bin.find({ owner: user._id });
                console.log(`User ${user.username} (ID: ${user._id}) owns ${userBins.length} bins.`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDatabase();
