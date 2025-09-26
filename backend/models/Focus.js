const mongoose = require('mongoose');

const focusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    order: {
        type: Number,
        default: 0 // For ordering tasks from 1 to n in focus mode
    },
    addedToFocusAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound indexes
focusSchema.index({ user: 1, task: 1 }, { unique: true }); // Prevent duplicate tasks in focus mode
focusSchema.index({ user: 1, order: 1 });
focusSchema.index({ user: 1, addedToFocusAt: -1 });

module.exports = mongoose.model('Focus', focusSchema);