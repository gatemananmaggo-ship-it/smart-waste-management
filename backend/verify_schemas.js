const mongoose = require('mongoose');
const Bin = require('./models/Bin');
const BinHistory = require('./models/BinHistory');

async function verify() {
    console.log('--- Verifying Schema Definitions ---');

    try {
        const dummyBin = new Bin({
            hardwareId: 'BIN-001',
            address: '123 Smart St, Tech City',
            fillLevel: 45,
            batteryLevel: 88,
            location: {
                latitude: 40.7128,
                longitude: -74.0060
            },
            status: 'Filling'
        });

        console.log('Dummy Bin Object created:');
        console.log(JSON.stringify(dummyBin, null, 2));

        const dummyHistory = new BinHistory({
            binId: dummyBin._id,
            fillLevel: 40,
            batteryLevel: 90
        });

        console.log('\nDummy History Object created:');
        console.log(JSON.stringify(dummyHistory, null, 2));

        console.log('\nVerification Successful: Schema objects instantiated correctly.');
    } catch (error) {
        console.error('\nVerification Failed:', error.message);
    }
}

verify();
