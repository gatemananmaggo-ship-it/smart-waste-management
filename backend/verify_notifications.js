require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Worker = require('./models/Worker');
const Bin = require('./models/Bin');
const Notification = require('./models/Notification');

async function verifyNotifications() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Find or create a test bin
        let bin = await Bin.findOne({ hardwareId: 'TEST-NOTIF-BIN' });
        if (!bin) {
            console.log('Creating test bin...');
            const admin = await User.findOne(); // Just get any admin for testing
            if (!admin) {
                console.error('No admin found in DB. Please create a user first.');
                process.exit(1);
            }
            bin = new Bin({
                hardwareId: 'TEST-NOTIF-BIN',
                address: '123 Test St',
                location: { latitude: 28.7, longitude: 77.1 },
                owner: admin._id
            });
            await bin.save();
        }

        const fillLevel = 95;
        console.log(`Simulating fill level update to ${fillLevel}% for bin ${bin.hardwareId}`);

        // 2. Replication of logic in binRoutes.js
        if (fillLevel >= 90) {
            const ownerUser = await User.findById(bin.owner);
            if (ownerUser) {
                console.log(`Found owner: ${ownerUser.username}`);
                
                // Find all workers linked to this hub who are available
                const linkedWorkers = await Worker.find({
                    linkedHubId: ownerUser.hubId,
                    isAvailable: { $ne: false }
                });

                console.log(`Found ${linkedWorkers.length} linked workers.`);

                // Build recipient list
                const recipients = [];
                if (ownerUser.phone) {
                    recipients.push({ 
                        id: ownerUser._id, 
                        name: 'Admin (' + ownerUser.username + ')', 
                        type: 'User' 
                    });
                }
                
                linkedWorkers.forEach(worker => {
                    recipients.push({ 
                        id: worker._id, 
                        name: 'Worker (' + worker.username + ')', 
                        type: 'Worker' 
                    });
                });

                if (recipients.length > 0) {
                    console.log(`Creating in-app notifications for ${recipients.length} recipients...`);
                    
                    for (const recipient of recipients) {
                        const newNotif = new Notification({
                            recipientId: recipient.id,
                            recipientType: recipient.type,
                            binId: bin.hardwareId,
                            message: `Alert: Bin ${bin.hardwareId} is ${fillLevel}% full. Location: ${bin.address}.`,
                            status: 'High Level'
                        });
                        await newNotif.save();
                        console.log(` - Created Notification for ${recipient.name}`);
                    }
                    
                    // Verify creation
                    const count = await Notification.countDocuments({ binId: bin.hardwareId });
                    console.log(`Verification: Total notifications for this bin in DB: ${count}`);
                } else {
                    console.log('No recipients found to notify.');
                }
            }
        }

        console.log('Verification script completed.');
        process.exit(0);
    } catch (err) {
        console.error('Verification Error:', err);
        process.exit(1);
    }
}

verifyNotifications();
