require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function debugUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const users = await User.find({});
        console.log('--- USER DATA ---');
        users.forEach(u => {
            console.log(`Username: ${u.username}`);
            console.log(` - Role: ${u.area_access === 'Worker' ? 'Worker' : 'Admin'}`);
            console.log(` - Phone: ${u.phone || 'MISSING'}`);
            console.log(` - Hub ID: ${u.hubId}`);
            console.log(` - Linked Hub ID: ${u.linkedHubId || 'NULL'}`);
            console.log(` - Available: ${u.isAvailable}`);
            console.log('-----------------');
        });
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

debugUsers();
