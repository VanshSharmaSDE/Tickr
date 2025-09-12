const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user should have only one settings record
    },
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    },
    taskViewMode: {
        type: String,
        enum: ['list', 'card'],
        default: 'list'
    },
    // Future settings can be added here
    notifications: {
        type: Boolean,
        default: true
    },
    language: {
        type: String,
        default: 'en'
    },
    animation: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create index on user field for faster queries
settingsSchema.index({ user: 1 });

module.exports = mongoose.model('Settings', settingsSchema);
