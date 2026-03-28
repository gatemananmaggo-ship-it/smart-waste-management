const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['admin', 'worker'],
        default: 'admin'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        description: "Admin who created this worker account"
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    area_access: {
        type: String,
        required: true,
        description: "The area/location for which the user has garbage bin access"
    },
    state: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    place: {
        type: String,
        trim: true
    },
    hubId: {
        type: String,
        required: true,
        unique: true,
        trim: true
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
        trim: true,
        default: null,
        description: "The Hub ID this worker is linked to for receiving SMS alerts"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);
