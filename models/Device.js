const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nombre: {
        type: String,
        required: true
    },
    modelo: {
        type: String,
        default: 'AirGuard-1'
    },
    estado: {
        type: String,
        enum: ['activo', 'inactivo', 'mantenimiento'],
        default: 'activo'
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Device', deviceSchema, 'devices');
