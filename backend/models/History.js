const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    hubId: {
        type: String,
        required: true,
        index: true
    },
    averageFillLevel: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('History', HistorySchema);
