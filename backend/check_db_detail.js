const mongoose = require('mongoose');
const User = require('./models/User');
const Bin = require('./models/Bin');
require('dotenv').config();

async function checkDatabaseDetail() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: 'Manan Singh Maggo' });
        if (!user) {
            console.log('User Manan Singh Maggo not found');
        } else {
            console.log(`User ID: "${user._id}" (Type: ${typeof user._id})`);
            console.log(`User ID String: "${user._id.toString()}"`);
            
            const bins = await Bin.find({ owner: user._id });
            console.log(`Querying Bin.find({ owner: user._id }) returns: ${bins.length} bins`);

            const allBins = await Bin.find({});
            if (allBins.length > 0) {
                console.log(`First bin in DB:`);
                console.log(` - ID: ${allBins[0]._id}`);
                console.log(` - Owner ID: "${allBins[0].owner}" (Type: ${typeof allBins[0].owner})`);
                console.log(` - Owner ID String: "${allBins[0].owner.toString()}"`);
                
                const match = allBins[0].owner.toString() === user._id.toString();
                console.log(`First bin owner matches user ID: ${match}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDatabaseDetail();
