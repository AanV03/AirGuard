const mongoose = require('mongoose');

const reporteSchema = new mongoose.Schema({
    tipo: { type: String, required: true, enum: ['error_dispositivo', 'error_cuenta', 'error_subusuarios', 'error_pagina'] },
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    descripcion: { type: String, required: true },
    dispositivo: { type: String },
    subusuario: { type: String },
    imagen: { type: String }, // URL si se guarda en disco o base64 si se sube así
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reporte', reporteSchema, 'Reports');
