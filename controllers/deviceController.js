const Device = require('../models/Device');

// 1) Obtener todos los dispositivos del usuario actual
exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find({ usuario_id: req.user.id });
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los dispositivos' });
    }
};

// 2) Obtener un dispositivo por ID (solo si es del usuario actual)
exports.getDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findOne({ _id: id, usuario_id: req.user.id });
        if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar dispositivo' });
    }
};

// 3) Crear un nuevo dispositivo (asociado al usuario logueado)
exports.createDevice = async (req, res) => {
    try {
        const { nombre, modelo, ubicacion, estado } = req.body;
        const newDevice = new Device({
            usuario_id: req.user.id, // ← extraído del token
            nombre,
            modelo,
            ubicacion,
            estado
        });
        await newDevice.save();
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4) Actualizar un dispositivo (solo si pertenece al usuario)
exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const device = await Device.findOneAndUpdate(
            { _id: id, usuario_id: req.user.id },
            updates,
            { new: true }
        );

        if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json(device);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar dispositivo' });
    }
};

// 5) Eliminar un dispositivo (solo si es del usuario)
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Device.findOneAndDelete({ _id: id, usuario_id: req.user.id });

        if (!deleted) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json({ message: 'Dispositivo eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar dispositivo' });
    }
};
