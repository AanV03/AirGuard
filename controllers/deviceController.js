const Device = require('../models/Device');

// Obtener todos los dispositivos
exports.getDevices = async (req, res) => {
    try {
        const devices = await Device.find();
        res.status(200).json(devices);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los dispositivos' });
    }
};

// Obtener un dispositivo por ID
exports.getDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const device = await Device.findById(id);
        if (!device) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json(device);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar dispositivo' });
    }
};

// Crear un nuevo dispositivo
exports.createDevice = async (req, res) => {
    try {
        const { usuario_id, modelo, ubicacion, estado, fecha_registro } = req.body;
        const newDevice = new Device({
            usuario_id,
            modelo,
            ubicacion,
            estado,
            fecha_registro
        });
        await newDevice.save();
        res.status(201).json(newDevice);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Actualizar un dispositivo existente
exports.updateDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const updatedDevice = await Device.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedDevice) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json(updatedDevice);
    } catch (error) {
        res.status(400).json({ error: 'Error al actualizar dispositivo' });
    }
};

// Eliminar un dispositivo
exports.deleteDevice = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Device.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Dispositivo no encontrado' });
        res.status(200).json({ message: 'Dispositivo eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar dispositivo' });
    }
};
