const mongoose = require('mongoose');

const HabitacionSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    lecturas: {
        CO: Number,
        PM1_0: Number,
        PM2_5: Number,
        PM10: Number,
        Humedad: Number,
        Temperatura: Number,
        VOCs: Number,
        H2: Number,
        CH4: Number,
        IAQ: Number
    },
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' }
});

const PisoSchema = new mongoose.Schema({
    numero: { type: Number, required: true },
    habitaciones: [HabitacionSchema]
});

const HomeLayoutSchema = new mongoose.Schema({
    usuario_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pisos: [PisoSchema]
});

module.exports = mongoose.model('HomeLayout', HomeLayoutSchema, 'Home');
