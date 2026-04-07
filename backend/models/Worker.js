const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        description: "Indian mobile number (10 digits)"
    },
    isAvailable: {
        type: Boolean,
        default: true,
        description: "Controls whether the worker receives SMS alerts for full bins"
    },
    linkedHubId: {
        type: String,
        required: true,
        trim: true,
        description: "The Hub ID this worker is linked to for receiving SMS alerts"
    },
    location: {
        latitude: { type: Number },
        longitude: { type: Number }
    },
    lastLocationUpdate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Worker', workerSchema);
