require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Bin = require('./models/Bin');
const smsService = require('./utils/smsService');

async function verifySMSTrigger() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find the test bin
        const bin = await Bin.findOne({ hardwareId: 'TEST-BIN-SMS' });
        if (!bin) {
            console.error('Test bin not found. Please create it first.');
            process.exit(1);
        }

        const fillLevel = 95; // High level to trigger SMS
        console.log(`Simulating fill level update to ${fillLevel}% for bin ${bin.hardwareId}`);

        // 2. Replication of logic in binRoutes.js
        if (fillLevel >= 90) {
            const ownerUser = await User.findById(bin.owner);
            if (ownerUser) {
                console.log(`Found owner: ${ownerUser.username} (Hub: ${ownerUser.hubId})`);
                
                // Find all workers linked to this hub who are available
                const linkedWorkers = await User.find({
                    linkedHubId: ownerUser.hubId,
                    isAvailable: { $ne: false },
                    phone: { $exists: true, $ne: '' }
                });

                // Build recipient list (Admin + Workers)
                const recipients = [];
                if (ownerUser.phone) {
                    recipients.push({ name: 'Admin (' + ownerUser.username + ')', phone: ownerUser.phone });
                }
                
                linkedWorkers.forEach(worker => {
                    recipients.push({ name: 'Worker (' + worker.username + ')', phone: worker.phone });
                });

                console.log(`Recipient list built: ${recipients.length} people`);
                recipients.forEach(r => console.log(` - ${r.name}: ${r.phone}`));

                if (recipients.length > 0) {
                    console.log(`[VERIFICATION] Would send SMS to ${recipients.length} recipients.`);
                    
                    // Actually trigger for the first recipient (Admin) as a real test
                    const testRecipient = recipients[0];
                    console.log(`[VERIFICATION] Actually sending test SMS to: ${testRecipient.phone}`);
                    
                    const result = await smsService.sendFullBinAlert(testRecipient.phone, bin.hardwareId, bin.address);
                    console.log('SMS Service Result:', JSON.stringify(result, null, 2));
                } else {
                    console.log('[VERIFICATION] No recipients found. Check your database setup.');
                }
            } else {
                console.error('Owner not found for bin.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifySMSTrigger();
