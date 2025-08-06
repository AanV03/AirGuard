const Home = require('../models/Home');
const Reading = require('../models/Reading');


// Obtener layout del usuario
exports.getLayout = async (req, res) => {
    try {
        const layout = await Home.findOne({ usuario_id: req.user.id });
        if (!layout) return res.status(200).json({ pisos: [] }); // inicial vacío
        res.status(200).json(layout);
    } catch (err) {
        console.error('[getLayout] Error:', err);
        res.status(500).json({ error: 'Error al obtener layout' });
    }
};

// Guardar o actualizar layout
exports.saveLayout = async (req, res) => {
    try {
        const { pisos } = req.body;
        if (!Array.isArray(pisos)) {
            return res.status(400).json({ error: 'Formato inválido de pisos' });
        }

        // 💡 Normaliza los pisos para asegurar que cada uno tenga `numero` y `habitaciones`
        const pisosNormalizados = pisos.map(p => ({
            numero: p.numero ?? 1, // En caso de que alguno no lo tenga
            habitaciones: Array.isArray(p.habitaciones) ? p.habitaciones : []
        }));

        const existente = await Home.findOne({ usuario_id: req.user.id });

        if (existente) {
            existente.pisos = pisosNormalizados;
            await existente.save();
            return res.status(200).json({ message: 'Layout actualizado' });
        }

        const nuevo = new Home({ usuario_id: req.user.id, pisos: pisosNormalizados });
        await nuevo.save();
        res.status(201).json({ message: 'Layout creado' });

    } catch (err) {
        console.error('[saveLayout] Error:', err);
        res.status(500).json({ error: 'Error al guardar layout' });
    }
};

// Eliminar el layout del usuario
exports.deleteLayout = async (req, res) => {
    try {
        const result = await Home.deleteOne({ usuario_id: req.user.id });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No se encontró una casa guardada' });
        }
        res.status(200).json({ message: 'Casa eliminada correctamente' });
    } catch (err) {
        console.error('[deleteLayout] Error:', err);
        res.status(500).json({ error: 'Error al eliminar layout' });
    }
};

// Obtener última lectura por dispositivo
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.getLastReadingByDispositivo_id = async (req, res) => {
    try {
        const { dispositivo_id } = req.params;

        if (!ObjectId.isValid(dispositivo_id)) {
            return res.status(400).json({ error: 'ID de dispositivo inválido' });
        }

        console.log('[getLastReading] buscando:', dispositivo_id);

        const lectura = await Reading.findOne({
            dispositivo_id: new ObjectId(dispositivo_id)
        }).sort({ timestamp: -1 });

        if (!lectura) {
            return res.status(404).json({ error: 'No hay lecturas registradas para este dispositivo' });
        }

        const datos = {
            CO: lectura.CO,
            PM1_0: lectura.PM1_0,
            PM2_5: lectura.PM2_5,
            PM10: lectura.PM10,
            Humedad: lectura.Humedad,
            Temperatura: lectura.Temperatura,
            VOCs: lectura.VOCs,
            H2: lectura.H2,
            CH4: lectura.CH4,
            IAQ: lectura.IAQ
        };

        res.status(200).json(datos);
    } catch (err) {
        console.error('[getLastReadingByDispositivo_id]', err);
        res.status(500).json({ error: 'Error al obtener la lectura' });
    }
};
