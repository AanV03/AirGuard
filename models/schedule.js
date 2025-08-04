const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    interval: {
        type: Number, // en minutos
        required: true
    },
    startTime: {
        type: String, // "HH:mm"
        required: true
    },
    endTime: {
        type: String, // "HH:mm"
        required: true
    },
    activeDays: {
        type: [String], // ["mon", "tue", ...]
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    descripcion: {
        type: String,
        default: ''
    }
});

module.exports = mongoose.model('Schedule', scheduleSchema, 'schedule');
