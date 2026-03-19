const mongoose = require('mongoose');

const binHistorySchema = new mongoose.Schema({
    binId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bin',
        required: true
    },
    fillLevel: Number,
    batteryLevel: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('BinHistory', binHistorySchema);
