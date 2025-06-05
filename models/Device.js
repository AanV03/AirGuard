const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modelo: {
        type: String,
        required: true
    },
    ubicacion: {
        lat: Number,
        long: Number
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

module.exports = mongoose.model('Device', deviceSchema);
