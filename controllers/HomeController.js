const Home = require('../models/Home');

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


