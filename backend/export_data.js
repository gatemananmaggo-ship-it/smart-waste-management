const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

const Bin = require('./models/Bin');
const BinHistory = require('./models/BinHistory');
const History = require('./models/History');

async function exportData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Export BinHistory
        const binHistories = await BinHistory.find({}).populate('binId').lean();
        if (binHistories.length > 0) {
            const csvHeaders = 'Timestamp,HardwareId,FillLevel,BatteryLevel\n';
            const csvRows = binHistories.map(row => {
                const hardwareId = row.binId ? row.binId.hardwareId : 'Unknown';
                return `${new Date(row.timestamp).toISOString()},${hardwareId},${row.fillLevel},${row.batteryLevel}`;
            }).join('\n');
            fs.writeFileSync('bin_history_export.csv', csvHeaders + csvRows);
            console.log(`Exported ${binHistories.length} records to bin_history_export.csv`);
        } else {
            console.log('No BinHistory data found.');
        }

        // Export Hub History
        const hubHistories = await History.find({}).lean();
        if (hubHistories.length > 0) {
            const csvHeaders = 'Timestamp,HubId,AverageFillLevel\n';
            const csvRows = hubHistories.map(row => {
                return `${new Date(row.timestamp).toISOString()},${row.hubId},${row.averageFillLevel}`;
            }).join('\n');
            fs.writeFileSync('hub_history_export.csv', csvHeaders + csvRows);
            console.log(`Exported ${hubHistories.length} records to hub_history_export.csv`);
        } else {
            console.log('No Hub History data found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

exportData();
