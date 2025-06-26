// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    ubicacion: {
        lat: Number,
        long: Number,
        ciudad: String,
        pais: String
    },
    fecha_creacion: {
        type: Date,
        default: Date.now
    }
});

// Middleware: hashea password antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Método para comparar contraseña
userSchema.methods.compararPassword = async function (entrada) {
    return await bcrypt.compare(entrada, this.password);
};

module.exports = mongoose.model('User', userSchema);
