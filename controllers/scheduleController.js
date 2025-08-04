const Schedule = require('../models/schedule');

exports.createSchedule = async (req, res) => {
    try {
        const { deviceId, interval, startTime, endTime, activeDays, descripcion } = req.body;

        if (!deviceId || !interval || !startTime || !endTime || !activeDays?.length) {
            return res.status(400).json({ message: "Datos incompletos." });
        }

        const newSchedule = new Schedule({
            deviceId,
            interval,
            startTime,
            endTime,
            activeDays,
            descripcion
        });

        await newSchedule.save();
        res.status(201).json({ message: "Horario guardado correctamente." });
    } catch (error) {
        console.error("Error creando horario:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

exports.getAllSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.status(200).json(schedules);
    } catch (error) {
        console.error("Error obteniendo horarios:", error);
        res.status(500).json({ message: "Error al obtener horarios." });
    }
};

exports.deleteSchedule = async (req, res) => {
    try {
        const id = req.params.id;
        const deleted = await Schedule.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Horario no encontrado.' });
        }
        res.status(200).json({ message: 'Horario eliminado correctamente.' });
    } catch (err) {
        console.error("Error al eliminar horario:", err);
        res.status(500).json({ message: 'Error al eliminar horario.' });
    }
};


