const mongoose = require('mongoose');

const taskProgressSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create compound index for user, task, and date
taskProgressSchema.index({ user: 1, task: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TaskProgress', taskProgressSchema);
