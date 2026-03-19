const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
    hardwareId: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },
    fillLevel: {
        type: Number,
        default: 0
    },
    batteryLevel: {
        type: Number,
        default: 100
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    status: {
        type: String,
        enum: ['Empty', 'Filling', 'Full', 'Maintenance'],
        default: 'Empty'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Bin', binSchema);