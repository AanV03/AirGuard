const cron = require('node-cron');
const Device = require('../models/Device');
const Schedule = require('../models/schedule');

function getCurrentTime() {
    const now = new Date();
    const hora = now.toTimeString().slice(0, 5); // "HH:mm"
    const dia = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][now.getDay()];
    return { hora, dia };
}

async function actualizarEstadosDispositivos() {
    const { hora, dia } = getCurrentTime();

    const schedules = await Schedule.find({});
    const estadosPorDispositivo = {};

    // Agrupar por dispositivo y validar si al menos un horario es activo
    schedules.forEach(s => {
        const id = s.deviceId.toString();
        const estaActivo = s.activeDays.includes(dia) && s.startTime <= hora && hora <= s.endTime;

        if (estaActivo) {
            estadosPorDispositivo[id] = 'activo';
        } else if (!(id in estadosPorDispositivo)) {
            // Solo se marca inactivo si no ha sido marcado activo antes
            estadosPorDispositivo[id] = 'inactivo';
        }
        console.log(`[verificación] ${id} - ${dia} ${hora} → ${estaActivo ? 'activo' : 'inactivo'}`);
    });

    // Actualizar todos los dispositivos
    const dispositivos = await Device.find({});
    for (const d of dispositivos) {
        const id = d._id.toString();
        const nuevoEstado = estadosPorDispositivo[id] || 'inactivo';
        if (d.estado !== nuevoEstado) {
            await Device.findByIdAndUpdate(d._id, { estado: nuevoEstado });
            console.log(`[estado] ${d.nombre} → ${nuevoEstado}`);
        }
    }
}

// Ejecutar cada minuto
cron.schedule('* * * * *', async () => {
    try {
        await actualizarEstadosDispositivos();
    } catch (err) {
        console.error('[cron estado] Error:', err);
    }
});

module.exports = { actualizarEstadosDispositivos };
